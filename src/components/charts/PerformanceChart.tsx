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
  apyBaseByUSDList: any[];
  apyPoolByUSDList: any[];
  apyQuoteByUSDList: any[];
  apyBaseByNativeList: any[];
  apyPoolByNativeList: any[];
  apyQuoteByNativeList: any[];
  usdOrNative: 'USD' | 'Native'
  colors?: IChartColor;
  height?: number;
  width?: number;
}

function PerformanceChart(props: IChart) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const {
    apyBaseByUSDList,
    apyPoolByUSDList,
    apyQuoteByUSDList,
    apyBaseByNativeList,
    apyPoolByNativeList,
    apyQuoteByNativeList,
    usdOrNative,
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

    const apyBaseSeries = chart.addLineSeries({
        priceScaleId: 'right'
    });
    apyBaseSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.1,
        bottom: 0.1,
      },
    });
    const apyPoolSeries = chart.addLineSeries({
        color: '#00ff00',
        priceScaleId: 'left'
    })
    apyPoolSeries.priceScale().applyOptions({
        scaleMargins: {
            top: 0.1,
            bottom: 0.1,
          },
    })
    const apyQuoteSeries = chart.addLineSeries({
        color: '#fff000',
        priceScaleId: 'left'
    })
    apyQuoteSeries.priceScale().applyOptions({
        scaleMargins: {
            top: 0.1,
            bottom: 0.1,
          },
    })

    if (usdOrNative === 'USD') {
        apyBaseSeries.setData(apyBaseByUSDList);
        apyPoolSeries.setData(apyPoolByUSDList);
        apyQuoteSeries.setData(apyQuoteByUSDList);
    } else {
        apyBaseSeries.setData(apyBaseByNativeList);
        apyPoolSeries.setData(apyPoolByNativeList);
        apyQuoteSeries.setData(apyQuoteByNativeList)
    }

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
    apyBaseByUSDList,
    apyPoolByUSDList,
    apyQuoteByUSDList,
    apyBaseByNativeList,
    apyPoolByNativeList,
    apyQuoteByNativeList,
    usdOrNative,
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

export default PerformanceChart;
