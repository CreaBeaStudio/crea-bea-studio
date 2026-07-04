import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { coloringPages } from "@/lib/coloringPages";
import ColoringPageModal from "@/app/[locale]/components/ColoringPageModal";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export default async function ColoringPageModalRoute({ params }: Props) {
  const { locale, slug } = await params;
  const page = coloringPages.find((p) => p.id === slug);
  if (!page) notFound();

  const t = await getTranslations({ locale, namespace: "coloringPages" });
  const isPaid = !!page.price;

  return (
    <ColoringPageModal
      page={page}
      isPaid={isPaid}
      previewLabel={t("previewLabel")}
      downloadButtonLabel={t("downloadButton")}
      comingSoonLabel={t("comingSoon")}
    />
  );
}
