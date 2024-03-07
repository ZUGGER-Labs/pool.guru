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
  tvl: any[];
  fee: any[];
  ratio: any[];
  colors?: IChartColor;
  height?: number;
  width?: number;
}

function TVLFeeChart(props: IChart) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const {
    tvl,
    fee,
    ratio,
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

    const tvlSeries = chart.addLineSeries({
        priceScaleId: 'right'
    });
    tvlSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.1,
        bottom: 0.2,
      },
    });
    const ratioSeries = chart.addLineSeries({
        color: '#00ff00',
        priceScaleId: 'left'
    })
    ratioSeries.priceScale().applyOptions({
        scaleMargins: {
            top: 0.1,
            bottom: 0.2,
          },
    })

    const volSeries = chart.addHistogramSeries({
      priceFormat: { type: "volume" },
      priceScaleId: "vol",
    });
    volSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.7,
        bottom: 0,
      },
    });
    tvlSeries.setData(tvl);
    volSeries.setData(fee);
    ratioSeries.setData(ratio)

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
    tvl,
    fee,
    ratio,
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

export default TVLFeeChart;
