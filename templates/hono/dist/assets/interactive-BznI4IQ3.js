import{r as e,t}from"./main-Bqi-VFEk.js";import{t as n}from"./Counter-CCEByS-J.js";function r(r){let i={code:`code`,h2:`h2`,img:`img`,p:`p`,...r.components};return t(e,{children:[t(i.h2,{children:`Preact-Komponente`}),`
`,t(i.p,{children:`MDX-Seiten können lokale Preact-Komponenten importieren und direkt rendern.`}),`
`,t(n,{initial:3}),`
`,t(i.h2,{children:`Bild`}),`
`,t(i.p,{children:[`Markdown-Bilder funktionieren wie in `,t(i.code,{children:`.md`}),`-Seiten:`]}),`
`,t(i.p,{children:t(i.img,{src:`https://picsum.photos/id/10/800/450`,alt:`Beispielfoto von Lorem Picsum`})}),`
`,t(i.h2,{children:`YouTube`}),`
`,t(i.p,{children:[`Einbetten mit einem normalen JSX-`,t(i.code,{children:`iframe`}),` (ersetze die Video-ID durch deine eigene):`]}),`
`,t(`iframe`,{width:`560`,height:`315`,src:`https://www.youtube.com/embed/aqz-KE-bpKQ`,title:`YouTube-Video-Beispiel`,frameBorder:`0`,allow:`accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share`,allowFullScreen:!0})]})}function i(e={}){let{wrapper:n}=e.components||{};return n?t(n,{...e,children:t(r,{...e})}):r(e)}export{i as default};