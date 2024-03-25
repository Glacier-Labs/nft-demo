import { Handlers, PageProps, type RouteContext } from "$fresh/server.ts";

export const handler: Handlers = {
  async GET(req, ctx) {
    return await ctx.render({ message: '' });
  },
  async POST(req, ctx) {
    const form = await req.formData();
    const file = form.get("my-file") as File;

    if (!file) {
      return ctx.render({
        message: `Please try again`,
      });
    }

    const name = file.name;
    const contents = await file.text();

    console.log(contents);

    return ctx.render({
      message: `${file.name} uploaded!`,
    });
  },
};

interface Data{
    message: string
}

export default function Upload(ctx: RouteContext) {
  const { message } = ctx.data;
  return (
    <>
      <form method="post" encType="multipart/form-data">
        <input type="file" name="my-file" />
        <button type="submit"  class="px-3 py-2 bg-blue-200 text-blue-800 rounded hover:bg-blue-300 active:bg-blue-400">Upload</button>
      </form>
      {message ? <p>{message}</p> : null}
    </>
  );
}