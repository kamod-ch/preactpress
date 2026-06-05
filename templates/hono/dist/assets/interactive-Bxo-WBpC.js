import{r as e,t}from"./main-Bqi-VFEk.js";import{t as n}from"./Counter-CCEByS-J.js";function r(r){let i={code:`code`,h2:`h2`,img:`img`,p:`p`,...r.components};return t(e,{children:[t(i.h2,{children:`Preact component`}),`
`,t(i.p,{children:`MDX pages can import local Preact components and render them inline.`}),`
`,t(n,{initial:3}),`
`,t(i.h2,{children:`Image`}),`
`,t(i.p,{children:[`Markdown images work like in `,t(i.code,{children:`.md`}),` pages:`]}),`
`,t(i.p,{children:t(i.img,{src:`https://picsum.photos/id/10/800/450`,alt:`Sample photo from Lorem Picsum`})}),`
`,t(i.h2,{children:`YouTube`}),`
`,t(i.p,{children:[`Embed with a normal JSX `,t(i.code,{children:`iframe`}),` (replace the video id with your own):`]}),`
`,t(`iframe`,{width:`560`,height:`315`,src:`https://www.youtube.com/embed/aqz-KE-bpKQ`,title:`YouTube video example`,frameBorder:`0`,allow:`accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share`,allowFullScreen:!0})]})}function i(e={}){let{wrapper:n}=e.components||{};return n?t(n,{...e,children:t(r,{...e})}):r(e)}export{i as default};