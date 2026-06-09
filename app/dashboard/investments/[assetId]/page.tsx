import React from 'react';
import PortfolioDetailsClient from '@/src/components/investments/portfolio-details-page';

interface Props {
  params: Promise<{ assetId: string }>;
}

export default function Page({ params }: Props) {
  const resolved = React.use(params);
  return <PortfolioDetailsClient assetId={resolved.assetId} />;
}
