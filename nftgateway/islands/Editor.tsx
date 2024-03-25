import { JSX } from "preact";
import { IS_BROWSER } from "$fresh/runtime.ts";
import { useEffect, useState } from "preact/hooks";

export function Editor(props: JSX.HTMLAttributes<HTMLFormElement>) {
  // Error: Hook "useState" cannot be used outside of an island component.
  const [selectedFile, setSelectedFile] = useState();
  const [preview, setPreview] = useState("");

  // https://stackoverflow.com/questions/38049966/get-image-preview-before-uploading-in-react
  // create a preview as a side effect, whenever selected file is changed
  useEffect(() => {
    if (!selectedFile) {
      setPreview("");
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);

    // free memory when ever this component is unmounted
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  const onSelectFile = (e) => {
    if (!e.target.files || e.target.files.length === 0) {
      setSelectedFile(undefined);
      return;
    }

    // I've kept this example simple by using the first image instead of multiple
    setSelectedFile(e.target.files[0]);
  };

  return (
    <>
      <form
        method="post"
        encType="multipart/form-data"
        className={"max-w-md mx-auto p-4 bg-white border border-gray-300 rounded shadow-sm"}
      >
        <label>
          Name:{" "}
          <input
            type="text"
            name="name"
            class=" bg-white border border-gray-300"
          >
          </input>
        </label>
        <br></br>
        <label>
          Description:{" "}
          <input
            type="text"
            name="description"
            class=" bg-white border border-gray-300"
          >
          </input>
        </label>
        <br></br>
        <label>
          ExternalUrl:{" "}
          <input
            type="text"
            name="external_url"
            class=" bg-white border border-gray-300"
          >
          </input>
        </label>
        <br></br>
        <label>
          Image:
          {/* <input id="dropzone-file" class="hidden" type="file" name="image" onChange={onSelectFile} /> */}
        </label>
        <br></br>

        <div class={selectedFile ? "hidden": "flex items-center justify-center w-full"}>
          <label
            for="dropzone-file"
            class="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
          >
            <div class="flex flex-col items-center justify-center pt-5 pb-6">
              <svg
                class="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 16"
              >
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                />
              </svg>
              <p class="mb-2 text-sm text-gray-500 dark:text-gray-400">
                <span class="font-semibold">Click to upload</span>{" "}
                or drag and drop
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                SVG, PNG, JPG or GIF (MAX. 800x400px)
              </p>
            </div>
            <input
              id="dropzone-file"
              type="file"
              class="hidden"
              name="image"
              onChange={onSelectFile}
            />
          </label>
        </div>
        {/* // https://bashooka.com/coding/css-javascript-file-upload-examples/ */}
        {selectedFile && <img src={preview} />}

        <div class="margin:auto">
          <button
            type="submit"
            class="px-3 py-2 bg-blue-200 text-blue-800 rounded hover:bg-blue-300 active:bg-blue-400"
          >
            InsertDocument
          </button>
        </div>
        <br></br>

       </form>
    </>
  );
}
