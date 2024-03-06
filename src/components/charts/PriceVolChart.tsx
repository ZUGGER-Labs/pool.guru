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
  ohcl: any[];
  vol: any[];
  colors?: IChartColor;
  height?: number;
  width?: number;
}

function PriceVolChart(props: IChart) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const {
    ohcl,
    vol,
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

    const candles = chart.addCandlestickSeries({});
    candles.priceScale().applyOptions({
      scaleMargins: {
        top: 0.1,
        bottom: 0.2,
      },
    });

    const volSeries = chart.addHistogramSeries({
      priceFormat: { type: "volume" },
      priceScaleId: "vol",
    });
    volSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.6,
        bottom: 0,
      },
    });
    candles.setData(ohcl);
    volSeries.setData(vol);

    // const newSeries = chart.addAreaSeries({
    //   lineColor,
    //   topColor: areaTopColor,
    //   bottomColor: areaBottomColor,
    // });
    // newSeries.setData(data);

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);

      chart.remove();
    };
  }, [
    ohcl,
    vol,
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

export default PriceVolChart;
