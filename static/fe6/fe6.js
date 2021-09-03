// ============= ui ===================
export function id(path) {
    return document.getElementById(path)
}

export function one(path) {
  return document.querySelector(path)
}

export function showPanel(name) {
    document.querySelectorAll('.panel').forEach((node)=>node.style.display='none')
    id(name).style.display = 'block'
}

export function escape(text) {
  return text.replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export function hash() {
  return decodeURI(window.location.hash)
}

// ============= router ===================
const triggers = []

export function route(regexp, f) {
  triggers.push([regexp, f])
  return this
}

export function final(f) {
  triggers.push([/.*/, f])
}

export async function onhash() {
  var hash = location.hash.trim()
  for (let [regexp, f] of triggers) {
    var m = hash.match(regexp)
    if (m) {
      // console.log('router.match(', regexp, ') m=', m)
      f(m, hash)
      return m
    }
  }
  return null
}

export function start(hash) {
  window.addEventListener('hashchange', onhash)
  return go(hash)
}

export function go(hash) {
  window.location.hash = hash
  return onhash()
}

export function on(obj, name, f) {
  obj.addEventListener(name, f)
}

