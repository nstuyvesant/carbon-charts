import { Component, AfterViewInit } from '@angular/core'
import { BaseChartComponent } from './base-chart.component'
import { ChoroplethChart as ChoroplethChartCore, type ChoroplethChartOptions } from '@carbon/charts'

/**
 * Wrapper around `ChoroplethChart` in carbon charts library
 *
 * Most functions just call their equivalent from the chart library.
 */
@Component({
	selector: 'ibm-choropleth-chart',
	template: ``
})
export class ChoroplethChartComponent extends BaseChartComponent implements AfterViewInit {
	/**
	 * Runs after view init to create a chart, attach it to `elementRef` and draw it.
	 */
	override ngAfterViewInit() {
		this.chart = new ChoroplethChartCore(this.elementRef.nativeElement as HTMLDivElement, {
			data: this.data,
			options: this.options as ChoroplethChartOptions
		})

		Object.assign(this, this.chart)
	}
}
