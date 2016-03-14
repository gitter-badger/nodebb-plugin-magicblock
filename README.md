# NodeBB MagicBlock plugin

[![Join the chat at https://gitter.im/qgp9/nodebb-plugin-magicblock](https://badges.gitter.im/qgp9/nodebb-plugin-magicblock.svg)](https://gitter.im/qgp9/nodebb-plugin-magicblock?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

NodeBB Plugin for macros, format, embeding.

* Discussion and examples at [NodeBB Forum](https://community.nodebb.org/topic/8098/some-ideas-and-on-going-development-of-new-plugin-called-magicblock)

## Updates
* v0.1.7 : support hackIframely. One can enable nodebb-plugin-iframely only in `{{..}}` without modifications of the iframely plugin.

## Usage

### Magic
```
{{ Any Link }}
{{ http://imgur.com/gallery/BxHKr }}
```
![Imgur gallery](http://i.imgur.com/HxvheyR.jpg)
* If you put any link in MagicBlock then MagicBlock will take care How show it With full customization.
* image, imgur gallery are built in, and you can add more or override them.
* Support *iFramely*( Enable iFramely only in `{{..}}` )  We have three options.
  * **Option 1)** [ With modified iframely plugin](https://github.com/qgp9/nodebb-plugin-iframely)  
    * set `magicTagADefaultClass: [ iframely ]` in MagicBlock admin UI
    * remove original iframely plugin
    * install the modified iframely plugin manualy from github.
    * set `iframely Class` to `iframely` in modified iframely admin UI
  * **Option 2)** Client side load : this doesn't implemented yet until somebody wants :)
  * **Option 3)** With an official iframely plugin. ( **RECOMENDED** )
    * set `hackIframely: true` in YAML. ( Of course, you need nodebb-plugin-iframely installed )
    * That's it.

### AttrString
`{{.class1.class2#color1#color2 BODY }}` 
* When a block begins with AttrString( begin with `.` or `#` and before a first white space )

#### Coloring
* A first color is for forground , a second is for backgoround color.
* Also rgb codes are possible. ( #eee or #e1e1e1 )
```
{{#red This is red letters}}
{{#red#green This is red letters on green background}}
```
![Coloring](http://i.imgur.com/awpTBc0.jpg)

#### Class
```
{{.class1 [link](http://example.com)}}` will become `<a href="http://example.com" class="class1">link</a>
```
* YES, class can make things messy, may be too much, usually useless BUT it's disabled by default. Solved!! :)

#### Wraping with `<span>` or `<div>`
* `<div>` : If an AttrString is ended with double colons (`::`), followed text will be wraped by `<div>`
* `<span>` : If an AttrString is ended with a colon (`:`), followed text will be wraped by `<span>`
* These are usually too much also, just turn it off !! ( by default )
```
{{.cls1#red:: Any text or link}} will become <div class="cls" style="color:red;">Any text or link</div>
{{.cls1#red: Any text or link}} will become <span class="cls" style="color:red;">Any text or link</span>
```
* Implicit way : If no colon(s) end of an AttrString
  * If begins of BODY is any html tag, MagicBlock insert classes and colors into it
    * NOTE : MagicBlock knows nothing of Markdown, but just manage htmls which are already converted by MarkdownIt.
    * With `{{ [link](url) }}`, what actually MagicBlock will see is `{{ <a href="url">link</a> }}`
    * With `{{ http://a.com  }}`, what actually MagicBlock will see is `{{ <a href="http://a.com">a.com</a>}}`
  * If begins of BODY is not a html tag, MagicBlock will wrap BODY with `<span>` 
```
{{.cls1#red ![txt](url)}} will become <img src="url" alt="txt" class="cls" style="color:red;">
{{.cls1#red  text}} will become <span class="cls" style="color:red;">text</span>
```
#### And,,
* Except #color, this AttrString can easily be too much. Recently I played wiki engins and I may be infected by wiki syntax and macros. Actually, I also plan to split magicblock as a standalone module from the nodeBB plugin, and they will be useful in other project ( At least for mine ).

### Macros
* A forum admin can add custom macros via admin UI
* examples ( built in )
```
{{br}} -> <br/>
{{ ALERT(info): This Info Box }}
{{ ALERT: This is default alert Box }}
{{ PANEL(success):  Body Only Panel }}
{{ PANEL(warning, This is title): Panel with title }}
```
![Macros](http://i.imgur.com/e64NYuT.jpg)

### Nested Block
MagicBlock also support nested blocks. Always innder block will be manipulated first. 
```
{{ALERT: These are {{#blue blue letters}} In the Alert Box}}
{{ALERT: This is {{ALERT(info): an Another Alert Box}} in the Alert Box }}
```

## Installation
```
npm install nodebb-plugin-magicblock
```

## Configuratoin
Currently single YAML string is only supported.
* In macros, a number in `(..)` means number of arguments. Arguments will replace each `<<1>> <<2>>`.
  * BODY of block will replace `<<BODY>>`
* Currently, only `<a>` tag can go thourgh magic. Others will come later ( but what will be useful after `<a> and <img>` ? ) 
* If you don't want macros or magicTagA then just `false` will be better then empty array or dictionary
  * `macros: false` 
### Example
```
---
attrStrAllowClass: false
attrStrAllowColor: true
attrStrAllowColon: false
attrStrAllowTwoColon: false
macros:
  br(0): '<br/>'
  ALERT(1): '<div class="alert alert-<<1>>"><<BODY>></div>'
  ALERT(0): '<div class="alert alert-warning"><<BODY>></div>'
  PANEL(1): '<div class="panel panel-<<1>>"><div class="panel-body"><<BODY>></div></div>'
  PANEL(2): '<div class="panel panel-<<1>>"><div class="panel-heading"><<2>></div><div class="panel-body"><<BODY>></div></div>'
magicTagA:
  - [ '.*(jpg|png|gif|svg)$' , true , '<img src="<<URL>>">' ]
  - - '^(?:http:)?//imgur.com/(?:a|gallery)/(\w+)'
    - true
    - '<blockquote class="imgur-embed-pub" lang="en" data-id="a/<<1>>"><a href="<<URL>>">View post on imgur.com</a></blockquote><script async src=s.imgur.com/min/embed.js" charset="utf-8"></script>'
magicTagADefaultClass: [ iframely ]
hackIframely: false
```

## Acknowledge
* This plugin is based on [nodebb-mega-colors](https://github.com/MegaGM/nodebb-plugin-mega-colors)
* Thanks to frissdiegurke for a lot of comments and guiding.
