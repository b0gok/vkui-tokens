import color from 'color';
import type { Property } from 'csstype';

import { GradientPoints } from '@/interfaces/general/gradients';

import { getVariableName } from '../themeProcessors/extractVarsNames/extractVarsNames';

export type OpacityPoints = [number, number][];

type GradientPointRaw = () => {
	value: Property.Color;
	key?: string;
	prefix?: string;
};

export const defaultOpacityPoints: OpacityPoints = [
	[0, 0],
	[0.05, 15],
	[0.2, 30],
	[0.8, 70],
	[0.95, 85],
	[1, 100],
];

export function makeGradientPointRaw(
	value: Property.Color,
	key?: string,
	prefix?: string,
): GradientPointRaw {
	return () => ({
		value,
		key,
		prefix,
	});
}

export function getGradientPointsFromColor(
	colorArg: Property.Color | GradientPointRaw,
	opacityMultiplier = 1,
	opacityPoints: OpacityPoints = defaultOpacityPoints,
): GradientPoints {
	const gradientPointData = typeof colorArg === 'function' ? colorArg() : { value: colorArg };

	const colorRGB: string = color(gradientPointData.value).rgb().array().slice(0, 3).join(', ');
	const colorAlpha = color(gradientPointData.value).alpha();

	return opacityPoints
		.map(([pointOpacity, pointCoordinate]) => {
			const targetOpacity = colorAlpha * pointOpacity;
			const colorValue = `rgba(${colorRGB}, ${Math.round(targetOpacity * opacityMultiplier * 1000) / 1000})`;

			if (typeof gradientPointData.key === 'string') {
				const tokenName = getVariableName({
					key: gradientPointData.key,
					prefix: gradientPointData.prefix,
				});

				return `var(${tokenName}, ${colorValue}) ${pointCoordinate}%`;
			}

			return `${colorValue} ${pointCoordinate}%`;
		})
		.join(', ');
}
