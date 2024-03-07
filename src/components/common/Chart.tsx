"use client";

import { ColorType, createChart } from "lightweight-charts";
import { useEffect, useRef } from "react";

export interface IChartColor {
  backgroundColor: string;
  lineColor: string;
  textColor: string;
  areaTopColor: string;
  areaBottomColor: string;
}

export interface IChart {
  data: unknown[];
  color?: IChartColor;
  height?: number;
  width?: number;
}

function Chart({ props }: { props: any }) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const {
    data,
    height,
    width,
    colors: {
      backgroundColor = "white",
      lineColor = "#2962FF",
      textColor = "black",
      areaTopColor = "#2962FF",
      areaBottomColor = "rgba(41, 98, 255, 0.28)",
    } = {},
  } = props;

  useEffect(() => {
    if (chartContainerRef.current === null) {
      return;
    }

    const handleResize = () => {
        if (!chartContainerRef.current) return;

      chart.applyOptions({ width: chartContainerRef.current.clientWidth });
    };

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: backgroundColor },
        textColor,
      },
      width: width ? width : chartContainerRef.current.clientWidth,
      height: height ? height : 300,
    });
    chart.timeScale().fitContent();

    const newSeries = chart.addAreaSeries({
      lineColor,
      topColor: areaTopColor,
      bottomColor: areaBottomColor,
    });
    newSeries.setData(data);

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);

      chart.remove();
    };
  }, [
    data,
    backgroundColor,
    lineColor,
    textColor,
    areaTopColor,
    areaBottomColor,
    height,
    width,
  ]);

  return <div ref={chartContainerRef} />;
}

export default Chart;
