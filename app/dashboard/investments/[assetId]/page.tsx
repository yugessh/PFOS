import React from 'react';
import PortfolioDetailsClient from '@/src/components/investments/portfolio-details-page';

interface Props {
  params: { assetId: string };
}

export default function Page({ params }: Props) {
  return <PortfolioDetailsClient assetId={params.assetId} />;
}
