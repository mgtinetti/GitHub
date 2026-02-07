import { notFound } from "next/navigation";
import YearRankingsClient from "./YearRankingsClient";

interface Props {
  params: Promise<{ year: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { year } = await params;
  return {
    title: `Best TV Shows of ${year}`,
    description: `See how Tinetti, Chubbs & Poteete ranked the best TV seasons of ${year}`,
  };
}

export default async function YearRankingsPage({ params }: Props) {
  const { year: yearStr } = await params;
  const year = parseInt(yearStr, 10);

  // Accept any reasonable year
  if (isNaN(year) || year < 2000 || year > 2100) {
    notFound();
  }

  return <YearRankingsClient year={year} />;
}
