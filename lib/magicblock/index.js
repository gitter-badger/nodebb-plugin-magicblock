'use strict'

let options = require( './options' );

let codeRegex = /(?:<pre>.*?<\/pre>|<code>.*?<\/code>)/g,
magicBlockRegex = /\{\{(.*?)\}\}/


/*======================== Exports  ========================*/
// FIXME: How to hide main class
//module.exports = MagicBlockEngine;
module.exports = magicBlockWraper;

/*======================== function  ========================*/

// FIXME: Split utilities/methods to files
function MagicBlockEngine() {
  // FIXME: options
  //opts = options.setOpts( opts )

  // parseAttrs(attrRaw) 
  // addAttrs - Deal with one magic block
  // parser - parse whole contents and extract nested block
  //          Inner block first by stack method.
}

MagicBlockEngine.prototype.parseAttrs = function (attrRaw) {
  let classAttr = []
  let colorAttr = []
  attrRaw.replace(/([\.#])([\w\-]+)/g, function (match, $1, $2) {
    if ($1 == '.') {
      classAttr.push($2)
    }else if ($1 == '#') {
      if ($2.match(/\D+/)) {
        colorAttr.push($2)
      } else {
        colorAttr.push($1 + $2)
      }
    }
  })
  if (colorAttr[0]) { colorAttr[0] = 'color:' + colorAttr[0] + ';'; }
  if (colorAttr[1]) { colorAttr[1] = 'background-color:' + colorAttr[1] + ';'; }
  return { 'classAttr': classAttr, 'colorAttr': colorAttr }
}

MagicBlockEngine.prototype.addAttrs = function (contents, attrs) {
  let matched
  // ADD Class
  if (attrs.classAttr && attrs.classAttr.length > 0) {
    if (matched = contents.match(/(^<[^>]+class=".*?)(".*)/)) {
      contents = matched[1] + ' ' + attrs.classAttr.join(' ') + matched[2]
    }else if (matched = contents.match(/(^<.*?)(>.*)/)) {
      contents = matched[1] + ' class="' + attrs.classAttr.join(' ') + '"' + matched[2]
    }
  }
  // ADD Color
  if (attrs.colorAttr && attrs.colorAttr.length > 0) {
    if (matched = contents.match(/(^<[^>]+style=".*?)(".*)/)) {
      contents = matched[1] + ' ' + attrs.colorAttr.join() + matched[2]
    }else if (matched = contents.match(/(^<.*?)(>.*)/)) {
      contents = matched[1] + ' style="' + attrs.colorAttr.join('') + '"' + matched[2]
    }
  }
  // TODO ADD styles, approved attrs
  return contents
}

MagicBlockEngine.prototype.magic = function (data) {
  // if it's link ( for only first <a> tag )
  let matched
  if (matched = data.match(/^<a[^>]+href="(.*?)".*?>(.*?)<\/a>/)) {
    let url = matched[1]
    let body = matched[2]
    // Images, TODO chance to give a format( border, wraper... )?
    if (matched = url.match(/.*?\/\/imgur.com\/a\/(\w+)/)) {
      let imgur_id = matched[1]
      return '<blockquote class="imgur-embed-pub" lang="en" data-id="a/' + imgur_id + '"><a href="//imgur.com/a/' + imgur_id + '">View post on imgur.com</a></blockquote><script async src="//s.imgur.com/min/embed.js" charset="utf-8"></script>'
    }
    if (matched = url.match(/([^\/\s]+(?:jpg|svg|png|gif))$/i)) {
      let filename = matched[1] || ''
      body = body.replace(/["']/g, '') // Strip quote from body/title
      return '<img src="' + url + '" alter="' + filename + '" title="' + body + '">'
    }
    // use iframely. TODO custom for well-known format?
    return this.addAttrs(data, { 'classAttr': ['iframely'] })
  }
  return data
}


MagicBlockEngine.prototype.parseBlock = function (data) {
  if (!data) return ''
  // if there is macroname ( no space between begin of block and name
    //let macroName = data.match(/^\w+/)
    //if (macroName && this.macros[macroName[0]]) {
      // TODO check existance of the macros and if it's string or function
      //return this.macros[macroName[0]](data)
    //}
    // If begin with attrs string ( .class color ), NO preceding space
    let matched = data.match(/^([\.#]\S+)(\s+)(.*)/)
    if (matched) {
      let attrs = this.parseAttrs(matched[1])
      if (matched.length < 4) matched.push(['', ''])
        if (matched[3] && matched[3].match(/^</) && !matched[1].match(/:$/)) {
          return this.addAttrs(matched[3], attrs)
        }else if (matched[1].match(/::$/)) {
          return this.addAttrs('<div>' + matched[3] + '</div>', attrs)
        } else {
          return this.addAttrs('<span>' + matched[3] + '</span>', attrs)
        }
    }
    // If no MacroName, no attrs string, then just magic
    return this.magic(data.trim())
}

MagicBlockEngine.prototype.parserContents = function (data) {
  // keep <code>...</code>
  console.log('DEBUG A1 : ' + data.nodeType)
  console.log(data)
  if (! data) return data
  let codeTags = []
  data = data.replace(codeRegex, function (match) {
    codeTags.push(match)
    return '___CODE___'
  })

  // Extract blocks and call MagicBlockEngine.parseBlock
  let matchList = []
  let result = ''
  let depth = 0
  let flag = -1; // 0=open, 1=close 
  let match1 = data.split(/(\{\{|\}\})/)
  let i = 0
  for (i = 0;i < match1.length;i++) {
    let s = match1[i]
    if (s == '{{') {
      flag = 0
    }else if (s == '}}') {
      flag = 1
    } else {
      if (flag == 0) {
        depth++
          matchList.push(s)
      } else {
        if (flag == 1) { depth--; }
        let tmp_result = ''
        if (depth < 0) {
          result += s
        }else if (depth == 0) {
          result += this.parseBlock(matchList.pop()) + s
        } else { // depth > 0
          tmp_result = this.parseBlock(matchList.pop())
          matchList[matchList.length - 1] += tmp_result + s
        }
      }
    }
  }
  data = result
  // Restore code block
  data = data.replace(/___CODE___/g, function (match) {
    return codeTags.shift()
  })
  return data
}

function magicBlockWraper( opts ){
  let mb = new MagicBlockEngine( opts );

  this.parse = function( data ){
    return mb.parserContents( data );
  }
}