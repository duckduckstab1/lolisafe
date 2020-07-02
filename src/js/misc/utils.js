/* global lsKeys, page */

// keys for localStorage
lsKeys.siBytes = 'siBytes'

page.prepareShareX = () => {
  const sharexElement = document.querySelector('#ShareX')
  if (!sharexElement) return

  const headers = {}

  if (page.token) {
    headers.token = page.token || ''
    headers.albumid = page.album || ''
  }

  headers.filelength = page.fileLength || ''
  headers.age = page.uploadAge || ''
  headers.striptags = page.stripTags || ''

  const origin = (window.location.host + window.location.pathname).replace(/\/(dashboard)?$/, '')
  const originClean = origin.replace(/\//g, '_')

  const sharexConfObj = {
    Name: originClean,
    DestinationType: 'ImageUploader, FileUploader',
    RequestMethod: 'POST',
    RequestURL: `${window.location.protocol}//${origin}/api/upload`,
    Headers: headers,
    Body: 'MultipartFromData',
    FileFormName: 'files[]',
    URL: '$json:files[0].url$',
    ThumbnailURL: '$json:files[0].url$'
  }

  /*
  if (page.token)
    sharexConfObj.DeletionURL = '$json:files[0].deleteUrl$'
  */

  const sharexConfStr = JSON.stringify(sharexConfObj, null, 2)
  const sharexBlob = new Blob([sharexConfStr], { type: 'application/octet-binary' })
  /* eslint-disable-next-line compat/compat */
  sharexElement.setAttribute('href', URL.createObjectURL(sharexBlob))
  sharexElement.setAttribute('download', `${originClean}.sxcu`)
}

page.getPrettyDate = date => {
  return date.getFullYear() + '/' +
    (date.getMonth() < 9 ? '0' : '') + // month's index starts from zero
    (date.getMonth() + 1) + '/' +
    (date.getDate() < 10 ? '0' : '') +
    date.getDate() + ' ' +
    (date.getHours() < 10 ? '0' : '') +
    date.getHours() + ':' +
    (date.getMinutes() < 10 ? '0' : '') +
    date.getMinutes() + ':' +
    (date.getSeconds() < 10 ? '0' : '') +
    date.getSeconds()
}

page.getPrettyBytes = num => {
  // MIT License
  // Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com)
  if (typeof num !== 'number' && !isFinite(num)) return num

  const si = localStorage[lsKeys.siBytes] !== '0'
  const neg = num < 0 ? '-' : ''
  const scale = si ? 1000 : 1024
  if (neg) num = -num
  if (num < scale) return `${neg}${num} B`

  const exponent = Math.min(Math.floor((Math.log(num) * Math.LOG10E) / 3), 8) // 8 is count of KMGTPEZY
  const numStr = Number((num / Math.pow(scale, exponent)).toPrecision(3))
  const pre = (si ? 'kMGTPEZY' : 'KMGTPEZY').charAt(exponent - 1) + (si ? '' : 'i')
  return `${neg}${numStr} ${pre}B`
}

page.escape = string => {
  // MIT License
  // Copyright(c) 2012-2013 TJ Holowaychuk
  // Copyright(c) 2015 Andreas Lubbe
  // Copyright(c) 2015 Tiancheng "Timothy" Gu

  if (!string)
    return string

  const str = String(string)
  const match = /["'&<>]/.exec(str)

  if (!match)
    return str

  let escape
  let html = ''
  let index = 0
  let lastIndex = 0

  for (index = match.index; index < str.length; index++) {
    switch (str.charCodeAt(index)) {
      case 34: // "
        escape = '&quot;'
        break
      case 38: // &
        escape = '&amp;'
        break
      case 39: // '
        escape = '&#39;'
        break
      case 60: // <
        escape = '&lt;'
        break
      case 62: // >
        escape = '&gt;'
        break
      default:
        continue
    }

    if (lastIndex !== index)
      html += str.substring(lastIndex, index)

    lastIndex = index + 1
    html += escape
  }

  return lastIndex !== index
    ? html + str.substring(lastIndex, index)
    : html
}
