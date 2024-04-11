"use client";

import moment from "moment";
import {
  ColorType,
  LineStyle,
  MouseEventParams,
  Time,
  createChart,
} from "lightweight-charts";
import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import dayjs from "dayjs";

export interface IChartColor {
  backgroundColor: string;
  textColor: string;
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
  isLoading?: boolean;
}

function PerformanceChart(props: IChart) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const toolTipRef = useRef<HTMLDivElement | null>(null);
  const toolTipWidth = 200;
  const toolTipHeight = 180;
  const toolTipMargin = 40;
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
    colors: { backgroundColor = "rgba(0, 0, 0, 0)", textColor = "black" } = {},
    isLoading,
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
      grid: {
        vertLines: {
          visible: false,
        },
        horzLines: {
          style: LineStyle.Solid,
          color: "rgba(197, 203, 206, 0.4)",
        },
      },
      crosshair: {
        horzLine: {
          visible: false,
          labelVisible: false,
        },
        vertLine: {
          visible: false,
          labelVisible: false,
        },
      },
      leftPriceScale: {
        visible: true,
      },
      rightPriceScale: {
        visible: false,
      },
      handleScroll: false,
      handleScale: {
        axisPressedMouseMove: false,
        mouseWheel: true,
        pinch: false,
      },
      timeScale: {
        fixLeftEdge: true,
        fixRightEdge: true,
        tickMarkFormatter: (unixTime: number) => {
          return dayjs.unix(unixTime).format("MM/DD");
        },
        allowBoldLabels: true,
        borderVisible: false,
      },
      width: width ? width : chartContainerRef.current.clientWidth,
      height: height ? height : 300,
    });
    chart.timeScale().fitContent();

    const apyBaseSeries = chart.addLineSeries({
      priceScaleId: "left",
      color: "#30d69a",
      priceLineVisible: false,
      lastValueVisible: false,
      priceFormat: {
        type: "custom",
        formatter: (price: any) => (price * 100).toFixed(2) + "%",
      },
    });
    apyBaseSeries.priceScale().applyOptions({
      autoScale: true,
      borderVisible: false,
    });
    const apyPoolSeries = chart.addLineSeries({
      color: "#8784f7",
      priceScaleId: "left",
      priceLineVisible: false,
      lastValueVisible: false,
      priceFormat: {
        type: "custom",
        formatter: (price: any) => (price * 100).toFixed(2) + "%",
      },
    });
    apyPoolSeries.priceScale().applyOptions({
      autoScale: true,
      borderVisible: false,
    });
    const apyQuoteSeries = chart.addLineSeries({
      color: "#49afe9",
      priceScaleId: "left",
      priceLineVisible: false,
      lastValueVisible: false,
      priceFormat: {
        type: "custom",
        formatter: (price: any) => (price * 100).toFixed(2) + "%",
      },
    });
    apyQuoteSeries.priceScale().applyOptions({
      autoScale: true,
      borderVisible: false,
    });

    if (usdOrNative === "USD") {
      apyBaseSeries.setData(apyBaseByUSDList);
      apyPoolSeries.setData(apyPoolByUSDList);
      apyQuoteSeries.setData(apyQuoteByUSDList);
    } else {
      apyBaseSeries.setData(apyBaseByNativeList);
      apyPoolSeries.setData(apyPoolByNativeList);
      apyQuoteSeries.setData(apyQuoteByNativeList);
    }

    chart.subscribeCrosshairMove((param) => {
      toolTipControl(param, apyPoolSeries);
        // toolTipControl(param, apyBaseSeries);
        // toolTipControl(param, apyQuoteSeries);
    });

    const toolTipControl = (param: any, series: any) => {
      if (toolTipRef.current && chartContainerRef.current) {
        // if (
        //   param.point === undefined ||
        //   !param.time ||
        //   param.point.x < 0 ||
        //   param.point.y < 0
        // ) {
        //   toolTipRef.current.style.display = "none";
        // } else {
        toolTipRef.current.style.display = "block";
        toolTipRef.current.style.position = "absolute";
        let localOffset = new Date().getTimezoneOffset();
        let dateToString = moment
          .unix(param.time)
          .utcOffset(localOffset)
          .format("DD MMMM YYYY HH:mm");
        const data = param.seriesData.get(series);
        const price = data && "value" in data ? data.value : "";
        // const currentPrice =
        //   chartData[chartData.length - 1] &&
        //   chartData[chartData.length - 1].value;

        toolTipRef.current.innerHTML = `
          <div style="padding: 8px">
            <span style="font-size: 16px;">${dateToString}</span>
            <div>
              <span>Uniswap LP</span>
             <span>${(price)}</span>
            </div>
            <div>
              <span>Token Pair HODL</span>
             <span>price</span>
            </div>
            <div>
              <span>100% TokenA HODL</span>
              <span>price</span>
            </div>
            <div>
              <span>100% TokenA HODL</span>
              <span>price</span>
            </div>
          </div>`;

        const y = param.point.y;
        let left = param.point.x + toolTipMargin;
        if (left > chartContainerRef.current.clientWidth - toolTipWidth) {
          left = param.point.x - toolTipMargin - toolTipWidth;
        }

        let top = y + toolTipMargin;
        if (top > chartContainerRef.current.clientHeight - toolTipHeight) {
          top = y - toolTipHeight - toolTipMargin;
        }
        toolTipRef.current.style.left = left + "px";
        toolTipRef.current.style.top = top + 400 + "px";
        // }
      }
    };

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
    textColor,
    height,
    width,
  ]);

  return (
    <>
      {!isLoading ? (
        <div ref={chartContainerRef}>
          <ToolTip ref={toolTipRef} />
        </div>
      ) : (
        <Loading></Loading>
      )}
    </>
  );
}

const ToolTip = styled.div`
  width: 200px;
  height: 180px;
  background-color: white;
  padding: 12px;
  box-sizing: border-box;
  font-size: 16px;
  text-align: left;
  z-index: 1000;
  pointer-events: none;
  border: 1px solid;
  border-radius: 2px;
`;

const Loading = styled.div`
  height: 320px;
`;

export default PerformanceChart;
