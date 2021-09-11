import * as ui6 from 'https://cccdeno.github.io/ui6/mod.js'

var fileToggle = ui6.one('#fileToggle')
var fileList = ui6.one('#fileList')
var readmeBox = ui6.one('#readmeBox')

function showFileList() {
  fileList.style.display = 'block'
  fileToggle.classList.add("fa-eye")
  fileToggle.classList.remove("fa-eye-slash")
}

function hideFileList() {
  fileList.style.display = 'none'
  fileToggle.classList.add("fa-eye-slash")
  fileToggle.classList.remove("fa-eye")
}

function main() {  
  if (fileToggle != null) {
    if (fileList != null) {
      if (readmeBox == null) {
        showFileList()
      } else {
        hideFileList()
      }
    }
    fileToggle.addEventListener('click', function () {
      if (fileList == null) return
      if (fileList.style.display == 'block') {
        hideFileList()
      } else {
        showFileList()
      }
    })
  }
}

main()
