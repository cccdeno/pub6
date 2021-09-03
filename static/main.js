import * as fe6 from './fe6/fe6.js'

var fileToggle = fe6.one('#fileToggle')
var fileList = fe6.one('#fileList')
var readmeBox = fe6.one('#readmeBox')

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