import * as md6 from 'https://deno.land/x/md6/mod.ts'

var setting = null

export function init(args) {
  setting = args
}

export function path2html(dpath) {
  const parts = dpath.split('/')
  const len = parts.length
  const links = [`<a href="/"><i class="fas fa-home"></i></a>`]
  const pStack = []
  for (let i = 0; i < len; i++) {
    pStack.push(parts[i])
    if (i == len-1)
      links.push(`<a href="/root/${pStack.join('/')}">${parts[i]}</a>`) // 最後一個不加 /
    else
      links.push(`<a href="/root/${pStack.join('/')}/">${parts[i]}</a>`) // 非最後，加 /
  }
  return links.join(' / ')
}

export function layout(dpath, body) {
  return `
  <html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta charset="UTF-8">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.2/css/all.min.css"/>
    <link rel="stylesheet" href="https://cccdeno.github.io/ui6/mod.css"/>
  </head>
  <body>
    <main>
      <article>
        <div id="header">${path2html(dpath)}</div>
        <div id="main">${body}</div>
        <footer>${setting.footer}</footer>
      </article>
    </main>
    <script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
    <script>
      MathJax = {
        tex: {
          inlineMath: [['$', '$'], ['\\\\(', '\\\\)']],
          displayMath: [             // start/end delimiter pairs for display math
            ['$$', '$$'],
            ['\\\\[', '\\\\]']
          ],
        }
      };
    </script>
    <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
    <script type="module" src="https://cccdeno.github.io/pub6/static/main.js"></script>
  </body>
  </html>
  `
}

export async function error(ctx, r) {
  ctx.response.type = 'text/html'
  ctx.response.body = layout(r.relPath, `<pre>${r.error}</pre>`)
}

export async function html(ctx, dpath, html) {
  ctx.response.type = 'text/html'
  ctx.response.body = layout(dpath, html)
}

export async function markdown(ctx, dpath, md) {
  let htm = md6.toHtml(md)
  html(ctx, dpath, htm)
}
