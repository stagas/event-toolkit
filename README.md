<h1>
event-toolkit <a href="https://npmjs.org/package/event-toolkit"><img src="https://img.shields.io/badge/npm-v0.0.0-F00.svg?colorA=000"/></a> <a href="src"><img src="https://img.shields.io/badge/loc-73-FFF.svg?colorA=000"/></a> <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-F0B.svg?colorA=000"/></a>
</h1>

<p></p>

Toolkit for DOM events.

<h4>
<table><tr><td title="Triple click to select and copy paste">
<code>npm i event-toolkit </code>
</td><td title="Triple click to select and copy paste">
<code>pnpm add event-toolkit </code>
</td><td title="Triple click to select and copy paste">
<code>yarn add event-toolkit</code>
</td></tr></table>
</h4>

## API

<p>  <details id="EventMapProxy$28" title="TypeAlias" ><summary><span><a href="#EventMapProxy$28">#</a></span>  <code><strong>EventMapProxy</strong></code>     &ndash; Event handler proxy. Returns Off.</summary>  <a href="src/on.ts#L34">src/on.ts#L34</a>  <ul><p>[K   in   <span>Keys</span>&lt;<a href="#T$29">T</a>&gt;  ]:  <span>ToEventFluent</span>&lt;<span>Fn</span>&lt;tuple, <a href="#Off$20">Off</a>&gt;&gt; &amp; [K   in   <span>SansOnKeys</span>&lt;<a href="#T$29">T</a>&gt;  ]:  <span>ToEventFluent</span>&lt;<span>Fn</span>&lt;tuple, <a href="#Off$20">Off</a>&gt;&gt;</p>        </ul></details><details id="Off$20" title="TypeAlias" ><summary><span><a href="#Off$20">#</a></span>  <code><strong>Off</strong></code>    </summary>  <a href="src/on.ts#L21">src/on.ts#L21</a>  <ul><p><details id="__type$21" title="Function" ><summary><span><a href="#__type$21">#</a></span>  <em>(fn)</em>     &ndash; Removes the event listener and callbacks <code>fn</code>.</summary>    <ul>    <p>    <details id="fn$23" title="Parameter" ><summary><span><a href="#fn$23">#</a></span>  <code><strong>fn</strong></code>    </summary>    <ul><p><a href="#Off$20">Off</a></p>        </ul></details>  <p><strong></strong><em>(fn)</em>  &nbsp;=&gt;  <ul>void</ul></p></p>    </ul></details></p>        </ul></details><details id="Target$1" title="TypeAlias" ><summary><span><a href="#Target$1">#</a></span>  <code><strong>Target</strong></code>     &ndash; Target element.</summary>  <a href="src/on.ts#L5">src/on.ts#L5</a>  <ul><p><span>HTMLElement</span> | <span>SVGElement</span> | <span>Window</span></p>        </ul></details><details id="on$30" title="Function" ><summary><span><a href="#on$30">#</a></span>  <code><strong>on</strong></code><em>(el)</em>     &ndash; Adds an event listener for <code>el</code> using fluent options.</summary>  <a href="src/on.ts#L111">src/on.ts#L111</a>  <ul>    <p>  <p>

```ts
on(btn).click(e => console.log('clicked'))
on(btn).click.once(e => console.log('clicked once'))
on(btn).wheel.not.passive(e => console.log('wheel not passive'))

const off = on(btn).pointerdown.capture(e => console.log('pointer down'))
off() // removes the listener

const offPointerMove = on(window).pointermove(e => console.log('pointer move'))
const offPointerUp = on(window).pointerup(e => console.log('pointer up'))
offPointerUp(offPointerMove) // remove both listeners shortcut syntax

const ctrl = new AbortController()
on(window).pointermove.signal(ctrl.signal)(e =>
  console.log('runs until aborted')
)
ctrl.abort() // removes the listener by signaling abort
```

</p>
  <details id="el$33" title="Parameter" ><summary><span><a href="#el$33">#</a></span>  <code><strong>el</strong></code>    </summary>    <ul><p><a href="#T$32">T</a></p>        </ul></details>  <p><strong>on</strong>&lt;<span>T</span><span>&nbsp;extends&nbsp;</span>     <a href="#Target$1">Target</a>&gt;<em>(el)</em>  &nbsp;=&gt;  <ul><a href="#EventMapProxy$28">EventMapProxy</a>&lt;<a href="#T$32">T</a>&gt;</ul></p></p>    </ul></details></p>

## Credits

- [to-fluent](https://npmjs.org/package/to-fluent) by [stagas](https://github.com/stagas) &ndash; Convert a function with a settings object to fluent API.
- [ts-toolbelt](https://npmjs.org/package/ts-toolbelt) by [Pierre-Antoine Mills](https://github.com/github.com) &ndash; TypeScript's largest utility library

## Contributing

[Fork](https://github.com/stagas/event-toolkit/fork) or [edit](https://github.dev/stagas/event-toolkit) and submit a PR.

All contributions are welcome!

## License

<a href="LICENSE">MIT</a> &copy; 2022 [stagas](https://github.com/stagas)
