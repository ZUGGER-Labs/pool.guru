"use client";

import { ColorType, createChart } from "lightweight-charts";
import { useEffect, useRef, useState } from "react";

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
  usdOrNative: "USD" | "Native";
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
      backgroundColor = "black",
      lineColor = "#2962FF",
      textColor = "white",
      areaTopColor = "#2962FF",
      areaBottomColor = "rgba(41, 98, 255, 0.28)",
    } = {},
  } = props;

  const [customTooltipVisible, setCustomTooltipVisible] = useState(false);

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
      grid: {
        vertLines: {
          visible: false,
        },
        horzLines: {
          visible: false,
        },
      },
      leftPriceScale: {
        visible: true,
      },
      rightPriceScale: {
        visible: false,
      },
      width: width ? width : chartContainerRef.current.clientWidth,
      height: height ? height : 300,
    });
    chart.timeScale().fitContent();

    const apyBaseSeries = chart.addLineSeries({
      priceScaleId: "right",
      priceFormat: {
        type: "custom",
        formatter: (price: any) => (price * 100).toFixed(2) + "%", // 将价格乘以 100 并保留两位小数
      },
    });
    apyBaseSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.1,
        bottom: 0.1,
      },
    });
    const apyPoolSeries = chart.addLineSeries({
      color: "#8784f7",
      priceScaleId: "left",
      priceFormat: {
        type: "custom",
        formatter: (price: any) => (price * 100).toFixed(2) + "%", // 将价格乘以 100 并保留两位小数
      },
    });
    apyPoolSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.1,
        bottom: 0.1,
      },
    });
    const apyQuoteSeries = chart.addLineSeries({
      color: "#ffa318",
      priceScaleId: "left",
      priceFormat: {
        type: "custom",
        formatter: (price: any) => (price * 100).toFixed(2) + "%", // 将价格乘以 100 并保留两位小数
      },
    });
    apyQuoteSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.1,
        bottom: 0.1,
      },
    });

    if (usdOrNative === "USD") {
      console.log(apyBaseByUSDList);
      console.log(apyPoolByUSDList);
      console.log(apyQuoteByUSDList);
      apyBaseSeries.setData(apyBaseByUSDList);
      apyPoolSeries.setData(apyPoolByUSDList);
      apyQuoteSeries.setData(apyQuoteByUSDList);
    } else {
      apyBaseSeries.setData(apyBaseByNativeList);
      apyPoolSeries.setData(apyPoolByNativeList);
      apyQuoteSeries.setData(apyQuoteByNativeList);
    }

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

  return (
    <div>
      <div ref={chartContainerRef} />
    </div>
  );

  return <div ref={chartContainerRef} />;
}

export default PerformanceChart;
