import { notFound } from "next/navigation";
import { marked } from "marked";
import { prisma } from "@/lib/db";

export default async function DestinationDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await prisma.contentPage.findUnique({ where: { slug } });
  if (!page || !page.published) notFound();

  // Content is authored by admins via the CMS (not end-user input), so
  // rendering the parsed markdown directly is an acceptable trust boundary here.
  const html = await marked.parse(page.bodyMarkdown);

  return (
    <article className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={page.heroImage} alt={page.title} className="h-64 w-full rounded-xl object-cover" />
      <div
        className="mt-8 max-w-none text-slate-700 [&_h1]:mb-3 [&_h1]:mt-6 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-slate-900 [&_h2]:mb-2 [&_h2]:mt-6 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-slate-900 [&_li]:ml-5 [&_li]:list-disc [&_p]:mb-4 [&_p]:leading-relaxed [&_ul]:mb-4"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </article>
  );
}
