import { Application, Router, send } from "https://deno.land/x/oak@v6.5.0/mod.ts";
import { join } from "https://deno.land/std/path/mod.ts"
import * as md6 from 'https://deno.land/x/md6/mod.ts'
import * as dlib6 from 'https://deno.land/x/dlib6/mod.ts'
import * as render from './render.js'

let root = Deno.cwd()

async function webFileInfo(wpath) {
  let r = {}
  try {
    r.relPath = decodeURIComponent(wpath)
    r.absPath = join(root, r.relPath)
    r.entry = await Deno.stat(r.absPath)
    r.status = 200
  } catch (error) {
    r.status = 404
    r.error = error
  }
  return r
}

function isDirectServeFile(dpath) {
  const exts = ['jpg', 'png', 'gif', 'svg', 'css', 'htm', 'html', 
                'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 
                'pdf', 'odt', 'odp']
  for (let ext of exts) {
    if (dpath.endsWith('.'+ext))
      return true
  }
  return false
}

async function dirList(fpath) {
  let list = []
  for await (const entry of Deno.readDir(fpath)) {
    list.push(entry)
    console.log('entry=', entry)
  }
  return list
}

async function dirToHtml(dpath) {
  let entries = await dirList(dpath) // await dlib6.dirList(dpath)
  entries.sort((a,b)=> a.name.localeCompare(b.name))
  console.log('entries=', entries)
  let rows = []
  for (let e of entries) {
    let name = e.isDirectory ? e.name+'/' : e.name
    let icon = e.isDirectory ? `<i class="far fa-folder-open"></i>` : `<i class="far fa-file-alt"></i>`
    rows.push(`<tr><td style="width:40px">${icon}</td><td><a href="/root/${join(dpath, name)}">${e.name}</a></td><td></td></tr>`)
  }
/*
  var html = `
  <div id="fileBox" class="wide border padding">
  <h2>檔案列表 <i class="fas" id="fileToggle"></i></h2>
  <table id="fileList" class="table wide" style="line-height:100%;">
  <tr><th>類型</th><th style="width:200px">名稱</th><th></th></tr>
  ${rows.join('\n')}
  </table>
  </div>`
*/
  var html = `
  <div id="fileBox" class="wide border padding">
  <h2>檔案列表 <i class="far fa-folder-open" id="fileToggle"></i></h2>
  <table id="fileList" class="table wide" style="line-height:100%;">
  <tr><th>類型</th><th style="width:200px">名稱</th><th></th></tr>
  ${rows.join('\n')}
  </table>
  </div>`
  console.log('html=', html)
  return html  
}

async function trySend(ctx, path, root) {
  try {
    await send(ctx, path, {
      root: root,
      index: "index.html",
    })
    return true   
  } catch (e) {
    return false
  }
}

async function webFile(ctx) {
  try {
    let wpath = ctx.params[0]
    let r = await webFileInfo(wpath)
    console.log(new Date().toISOString(), '/root/'+wpath)
    if (r.error) {
      render.error(ctx, r)
    } else if (r.entry.isDirectory) {
      console.log('r.relPath=', r.relPath)
      console.log('r.absPath=', r.absPath)
      let indexSend = await trySend(ctx, r.relPath, root)
      /*
      let indexSend = await send(ctx, r.relPath, {
          root: root,
          index: "index.html",
        })
      */
      if (!indexSend) {
        let html = await dirToHtml(r.absPath)
        let r1 = await webFileInfo(join(wpath, 'README.md'))
        console.log('r1=', r1)
        if (r1.status == 200) { // 有 README.md 就顯示
          let md = await Deno.readTextFile(r1.absPath)
          html += `<div id="readmeBox" class="wide border padding"><h2>README.md</h2>${md6.toHtml(md)}</div>`
        }
        await render.html(ctx, r.relPath, html) 
        console.log('render complete!') 
      }
    } else if (r.entry.isFile) {
      if (r.absPath.endsWith('.md')) { // Markdown 檔案
        let md = await Deno.readTextFile(r.absPath)
        await render.markdown(ctx, r.relPath, md)
      } else if (isDirectServeFile(r.absPath)) { // 圖檔/CSS/HTML => 直接回應
        await send(ctx, r.relPath, { root: root })
      } else { // 視為文字檔顯示原始碼
        let text = await Deno.readTextFile(r.absPath)
        let html = `<pre>${text}</pre>`
        await render.html(ctx, r.relPath, html)
      }
    }
  } catch (error) {
    console.error('webFile: error=', error)
  }
}

export async function serve(dir, port) {
  root = dir
  console.log('root=%s port=%d', root, port)
  let footerMd = await dlib6.readFile(join(root, '_footer.md')) || "" // await Deno.readTextFile(join(root, '_footer.md'))
  let footer = md6.toHtml(footerMd)
  
  render.init({footer})
  try {
    const app = new Application()
  
    const router = new Router();
    router
      .get("/", (ctx) => { ctx.response.redirect('/root/') })
      .get("/root/(.*)", webFile)
  
    app.use(router.routes())
    app.use(router.allowedMethods())
    app.listen({
      port: port,
    })
    console.log(`start at : http://localhost:${port}`)
  } catch (error) {
    console.error('main catch error:', error)
    Deno.exit()
  }  
}
