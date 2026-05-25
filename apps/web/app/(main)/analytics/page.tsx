import React, { Suspense } from 'react'
export const dynamic = "force-dynamic";
import { ChartAreaInteractive } from '~/components/sidebar/chart-area-interactive'
import { DataTable } from '~/components/sidebar/data-table'
import { SectionCards } from '~/components/sidebar/section-cards'
import { Spinner } from '~/components/ui/spinner'

import data from "../data.json"

function AnalyticsContent() {
  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <SectionCards />
        <div className="px-4 lg:px-6">
          <ChartAreaInteractive />
        </div>
        <DataTable data={data} />
      </div>
    </div>
  )
}

function page() {
  return (
    <div className="flex flex-1 flex-col">
      <Suspense fallback={<div className="flex justify-center py-12"><Spinner /></div>}>
        <AnalyticsContent />
      </Suspense>
    </div>
  )
}

export default page