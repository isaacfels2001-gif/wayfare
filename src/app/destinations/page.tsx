import Link from "next/link";
import { prisma } from "@/lib/db";
import { Card, CardBody } from "@/components/ui/Card";

export default async function DestinationsPage() {
  const pages = await prisma.contentPage.findMany({ where: { published: true }, orderBy: { title: "asc" } });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-slate-900">Destination guides</h1>
      <p className="mt-1 text-sm text-slate-500">Editorial content managed from the admin CMS.</p>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {pages.map((page) => (
          <Link key={page.slug} href={`/destinations/${page.slug}`}>
            <Card className="overflow-hidden transition-shadow hover:shadow-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={page.heroImage} alt={page.title} className="h-40 w-full object-cover" />
              <CardBody>
                <h3 className="font-semibold text-slate-900">{page.title}</h3>
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
