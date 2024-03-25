import { JSX } from "preact";
import { IS_BROWSER } from "$fresh/runtime.ts";
import { useEffect, useState } from "preact/hooks";
import { gray } from "https://deno.land/std@0.211.0/fmt/colors.ts";
import { CSS, render } from "$gfm";

interface MetaProps{
    docid: string
    url: string
    meta: string
}

export function NFTMeta(props: JSX.HTMLAttributes<HTMLBaseElement> & MetaProps) {
  if (!props.docid) {
    return (<>DocID Not Found</>)
  }

  const [preview, setPreview] = useState("");


  setPreview(`${props.url}/api/${props.docid}/image/image`)
  const code = `
  \`\`\`json
  ${props.meta}
  \`\`\`
  `

  return (
    <>
      <div
        className={"flex flex-col text-wrap max-w-md mx-auto p-4 bg-white border rounded shadow-sm"}
      >
        <p class="text-pretty">DocID: {props.docid}</p>
        <img src={preview} class="bg-gray basis-1/2"></img>

        {/* <textarea>NFTMeta: {props.meta}</textarea> */}
        <div
          class="markdown-body text-pretty"
          dangerouslySetInnerHTML={{ __html: render(props.meta) }}
        />
        {/* <p class="text-pretty">NFTMeta: {props.meta}</p> */}
      </div>
    </>
  );
}
