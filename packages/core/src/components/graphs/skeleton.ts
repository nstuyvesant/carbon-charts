import { arc, easeLinear, scaleLinear, type ScaleLinear, type Selection } from 'd3'
import { getProperty } from '@/tools'
import { pie as pieConfigs } from '@/configuration'
import { Component } from '@/components/component'
import { DOMUtils } from '@/services/essentials/dom-utils'
import { Skeletons, CartesianOrientations, Alignments } from '@/interfaces/enums'

export class Skeleton extends Component {
	type = 'skeleton'
	xScale: ScaleLinear<number, number>
	yScale: ScaleLinear<number, number>
	backdrop: Selection<SVGElement | HTMLDivElement, unknown, Element, any>

	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	render(animate = true) {
		const isDataLoading = getProperty(this.getOptions(), 'data', 'loading')

		// display a skeleton if there is no chart data or the loading flag is set to true
		if (isDataLoading) {
			this.renderSkeleton(isDataLoading)
		} else {
			this.removeSkeleton()
		}
	}

	renderSkeleton(showShimmerEffect: boolean) {
		if (this.configs.skeleton === Skeletons.GRID) {
			this.renderGridSkeleton(showShimmerEffect)
		} else if (this.configs.skeleton === Skeletons.VERT_OR_HORIZ) {
			this.renderVertOrHorizSkeleton(showShimmerEffect)
		} else if (this.configs.skeleton === Skeletons.PIE) {
			this.renderPieSkeleton(showShimmerEffect)
		} else if (this.configs.skeleton === Skeletons.DONUT) {
			this.renderDonutSkeleton(showShimmerEffect)
		} else {
			throw new Error(`"${this.configs.skeleton}" is not a valid Skeleton type.`)
		}
	}

	renderGridSkeleton(showShimmerEffect: boolean) {
		this.setScales()
		this.drawBackdrop(showShimmerEffect)
		this.drawXGrid(showShimmerEffect)
		this.drawYGrid(showShimmerEffect)
		if (showShimmerEffect) {
			this.setShimmerEffect('shimmer-lines')
		}
	}

	renderVertOrHorizSkeleton(showShimmerEffect: boolean) {
		const orientation = this.services.cartesianScales.getOrientation()
		this.setScales()
		this.drawBackdrop(showShimmerEffect)
		if (orientation === CartesianOrientations.VERTICAL) {
			this.drawYGrid(showShimmerEffect)
		}
		if (orientation === CartesianOrientations.HORIZONTAL) {
			this.drawXGrid(showShimmerEffect)
		}

		this.setShimmerEffect('shimmer-lines')
	}

	renderPieSkeleton(showShimmerEffect: boolean) {
		const outerRadius = this.computeOuterRadius()
		const innerRadius = 0
		this.drawRing(outerRadius, innerRadius, showShimmerEffect)
		if (showShimmerEffect) {
			this.setShimmerEffect('shimmer-areas')
		}
	}

	renderDonutSkeleton(showShimmerEffect: boolean) {
		const outerRadius = this.computeOuterRadius()
		const innerRadius = this.computeInnerRadius()
		this.drawRing(outerRadius, innerRadius, showShimmerEffect)
		if (showShimmerEffect) {
			this.setShimmerEffect('shimmer-areas')
		}
	}

	setScales() {
		const xRange = this.services.cartesianScales.getMainXScale().range()
		const yRange = this.services.cartesianScales.getMainYScale().range()
		this.xScale = scaleLinear().domain([0, 1]).range(xRange)
		this.yScale = scaleLinear().domain([0, 1]).range(yRange)
	}

	drawBackdrop(showShimmerEffect: boolean) {
		const svg = this.parent
		const { width, height } = DOMUtils.getSVGElementSize(svg as any, {
			useAttrs: true
		})

		this.backdrop = DOMUtils.appendOrSelect(svg, 'svg.chart-skeleton.DAII')
			.attr('role', 'presentation')
			.attr('width', width)
			.attr('height', height)

		const backdropRect = DOMUtils.appendOrSelect(this.backdrop, 'rect.chart-skeleton-backdrop')
		backdropRect.attr('width', '100%').attr('height', '100%')

		const [xScaleStart] = this.xScale.range()
		const [, yScaleStart] = this.yScale.range()

		this.backdrop.merge(backdropRect).attr('x', xScaleStart).attr('y', yScaleStart)

		backdropRect
			.classed('shimmer-effect-lines', showShimmerEffect)
			.classed('empty-state-lines', !showShimmerEffect)
			.style(
				'stroke',
				showShimmerEffect
					? `url(#${this.services.domUtils.generateElementIDString(`shimmer-lines`)})`
					: null
			)
	}

	drawXGrid(showShimmerEffect: boolean) {
		const width = +this.backdrop.attr('width')
		const ticksNumber = getProperty(this.getOptions(), 'grid', 'x', 'numberOfTicks')
		const ticksValues = this.xScale.ticks(ticksNumber).map((d: any) => d * width)

		const xGridG = DOMUtils.appendOrSelect(this.backdrop, 'g.x.skeleton')
		const update = xGridG.selectAll('line').data(ticksValues)
		update
			.enter()
			.append('line')
			.merge(update as any)
			.attr('x1', (d: any) => d)
			.attr('x2', (d: any) => d)
			.attr('y1', 0)
			.attr('y2', '100%')

		xGridG
			.selectAll('line')
			.classed('shimmer-effect-lines', showShimmerEffect)
			.classed('empty-state-lines', !showShimmerEffect)
			.style(
				'stroke',
				showShimmerEffect
					? `url(#${this.services.domUtils.generateElementIDString(`shimmer-lines`)})`
					: null
			)
	}

	drawYGrid(showShimmerEffect: boolean) {
		const height = +this.backdrop.attr('height')
		const width = this.backdrop.attr('width')
		const ticksNumber = getProperty(this.getOptions(), 'grid', 'y', 'numberOfTicks')
		const ticksValues = this.xScale.ticks(ticksNumber).map((d: any) => d * height)

		const yGridG = DOMUtils.appendOrSelect(this.backdrop, 'g.y.skeleton')
		const update = yGridG.selectAll('line').data(ticksValues)
		update
			.enter()
			.append('line')
			.merge(update as any)
			.attr('x1', 0)
			.attr('x2', width)
			.attr('y1', (d: any) => d)
			.attr('y2', (d: any) => d)

		yGridG
			.selectAll('line')
			.classed('shimmer-effect-lines', showShimmerEffect)
			.classed('empty-state-lines', !showShimmerEffect)
			.style(
				'stroke',
				showShimmerEffect
					? `url(#${this.services.domUtils.generateElementIDString(`shimmer-lines`)})`
					: null
			)
	}

	drawRing(outerRadius: number, innerRadius: number, shimmer = true) {
		const svg = this.parent
		const { width, height } = DOMUtils.getSVGElementSize(svg as any, {
			useAttrs: true
		})

		const container = DOMUtils.appendOrSelect(svg, 'svg.chart-skeleton')
			.attr('width', width)
			.attr('height', height)
			.attr('role', 'presentation')

		const optionName = innerRadius === 0 ? 'pie' : 'donut'

		const alignment = getProperty(this.getOptions(), optionName, 'alignment')

		DOMUtils.appendOrSelect(container, 'rect.chart-skeleton-area-container')
			.attr('width', width)
			.attr('height', height)
			.attr('fill', 'none')

		const arcPathGenerator = arc()
			.innerRadius(innerRadius)
			.outerRadius(outerRadius)
			.startAngle(0)
			.endAngle(Math.PI * 2)

		// centering circle inside the container
		const tcx = outerRadius + Math.abs(pieConfigs.radiusOffset)
		const tcy = outerRadius + (Math.min(width, height) - outerRadius * 2) / 2

		const skeletonAreaShape = DOMUtils.appendOrSelect(container, 'path')
			.attr('class', 'skeleton-area-shape')
			.attr('transform', `translate(${tcx}, ${tcy})`)
			.attr('d', arcPathGenerator)
			.classed('shimmer-effect-areas', shimmer)
			.classed('empty-state-areas', !shimmer)
			.style(
				'fill',
				shimmer ? `url(#${this.services.domUtils.generateElementIDString(`shimmer-areas`)})` : null
			)

		// Position skeleton
		let translateX = outerRadius + pieConfigs.xOffset
		if (alignment === Alignments.CENTER) {
			translateX = width / 2
		} else if (alignment === Alignments.RIGHT) {
			translateX = width - outerRadius - pieConfigs.xOffset
		}

		const translateY = outerRadius + pieConfigs.yOffset
		skeletonAreaShape.attr('transform', `translate(${translateX}, ${translateY})`)
	}

	// same logic in pie
	computeOuterRadius() {
		const { width, height } = DOMUtils.getSVGElementSize(this.parent as any, {
			useAttrs: true
		})
		const radius = Math.min(width, height) / 2
		return radius + pieConfigs.radiusOffset
	}

	// same logic in donut
	computeInnerRadius() {
		return this.computeOuterRadius() * (3 / 4)
	}

	setShimmerEffect(gradientId: string) {
		const animationDuration = 2000 // ms
		const delay = 1000 // ms
		const shimmerWidth = 0.2
		const stopBgShimmerClass = 'stop-bg-shimmer'
		const stopShimmerClass = 'stop-shimmer'
		const container = this.parent.select('.chart-skeleton')
		const { width } = DOMUtils.getSVGElementSize(this.parent as any, {
			useAttrs: true
		})
		const startPoint = 0
		const endPoint = width

		// append the defs as first child of container
		const defs = DOMUtils.appendOrSelect(container as any, 'defs').lower()
		const linearGradient = DOMUtils.appendOrSelect(defs, 'linearGradient')
			.attr('id', this.services.domUtils.generateElementIDString(gradientId))
			.attr('class', gradientId)
			.attr('x1', startPoint - 3 * shimmerWidth * width)
			.attr('x2', endPoint)
			.attr('y1', 0)
			.attr('y2', 0)
			.attr('gradientUnits', 'userSpaceOnUse')
			.attr('gradientTransform', `translate(0, 0)`)
		const stops = `
			<stop class="${stopBgShimmerClass}" offset="${startPoint}"></stop>
			<stop class="${stopShimmerClass}" offset="${startPoint + shimmerWidth}"></stop>
			<stop class="${stopBgShimmerClass}" offset="${startPoint + 2 * shimmerWidth}"></stop>
		`
		linearGradient.html(stops)

		repeat()
		function repeat() {
			linearGradient
				.attr('gradientTransform', `translate(${startPoint - 3 * shimmerWidth * width}, 0)`)
				.transition()
				.duration(animationDuration)
				.delay(delay)
				.ease(easeLinear)
				.attr('gradientTransform', `translate(${endPoint + 3 * shimmerWidth * width}, 0)`)
				.on('end', repeat)
		}
	}

	removeSkeleton() {
		const container = this.parent.select('.chart-skeleton')
		container.remove()
	}
}
