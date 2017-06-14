window.addEventListener("load", function() {
  if (window.File && window.FileReader && window.FileList && window.Blob) {
      //alert("Great success! All the File APIs are supported.");
      openFile();
    } else {
      alert('The File APIs are not fully supported in this browser.');
    }
})
//---------------------------------
function openFile(event) {
  var input = event.target;
  var reader = new FileReader();
  var NumAry;
  var n = 5; var m =10; p = 20;
  reader.onload = function(){
    var text = [];
    var node = document.getElementById('output');
    text = reader.result;
    //原始資料由字串轉陣列
    NumAry = StrToAry(text);
    //計算移動平均: 參數1為原始資料、參數2為天數、參數數3為新增列數
    //計算5日動平均
    NumAry = MovingAverage(NumAry, n, NumAry.length);
    //計算10日動平均
    NumAry = MovingAverage(NumAry, m, NumAry.length);   
    //計算20日動平均
    NumAry = MovingAverage(NumAry, p, NumAry.length);   
    //刪除移動平均為0的資料
    NumAry = EraseMA0(NumAry, NumAry.length-1, p);
    //畫走勢圖
    BuySellMark = BuySell(NumAry);

    drawplot(NumAry, BuySellMark);
  }
  reader.readAsText(input.files[0]);
}
//將原始資料由字串陣列
function StrToAry(rawdata) {
  var StrByLine = rawdata.split('\n');
  var row = StrByLine.length-1;
  var col = 100;
  num = new Array(row);
  for (i = 0; i < row; i++) {
    if (i == 0) {
      StrByLine[i]=StrByLine[i].replace(/\//g,"-");
      num[i] = new Array(col);
      num[i] = StrByLine[i].split("\t");
    } else {
        num[i] = new Array(col);
        num[i] = StrByLine[i].split('\t');
    }
    console.log("num = " + num[i]);
  }
  console.log(num);
  return num;
}
//計算n日移動平均
function MovingAverage(data, n, rn) {
  var MoveMean = [];
  var SumV = 0;
  var col = 100;
  data[rn] = new Array(col);
  for (i = 0 ;i<n-1; i+=1) {
    data[rn][i] = 0;
  }
  for (var i = n-1; i < col; i+=1) {
    SumV = 0;
    console.log("i = " + i);
    for (var j = i; j >= i-n+1; j-=1) {
      console.log("j = " + j);
      console.log("data[4][" + j +"] = " + data[4][j]);
      SumV += parseFloat(data[4][j]);
    }
    MoveMean = SumV / n;
    console.log("SumV = " + SumV);
    console.log("movemeav = " + MoveMean);
    data[rn][i] =  MoveMean;
    console.log("data[5][" + i +"] = " + data[rn][i]);
    MoveMean = [];
  }
  console.log(data[5]);
  return data;
}
//刪除移動平均後值為0的資料
function EraseMA0(data, row, m) {
  for (var i = 0; i <= row; i+=1) {
    data[i].splice(0, m);
  }
  return data;
}
//鄰斷買賣點並標示符號
function BuySell(NA) {
  var col = NA[0].length; var xbuy = []; var ybuy = []; var xsell = []; var ysell = []; var roi = []; var sumroi = 0;
  var j = 0; var k = 0; var flag = false; var result = new Array(4);
  //var showroi = document.getElementById('result');
  for (var i = 0; i < col; i+=1) {
    //五日>十日>二十日且五日、十日、二十日上升就買進
    if ((NA[5][i] > NA[6][i]) && (NA[5][i] > NA[7][i]) && (NA[5][i] > NA[5][i-1]) && (NA[6][i] > NA[6][i-1]) && (NA[7][i] > NA[7][i-1]) && flag == false)  {
      xbuy[j] = NA[0][i];
      ybuy[j] = NA[4][i];
      flag = true;
      j+=1;
    }

    //五日>十日>二十日且五日、十日下降就賣出
    if ((NA[5][i] > NA[6][i]) && (NA[5][i] > NA[7][i])  && (NA[5][i] < NA[5][i-1]) && (NA[6][i] < NA[6][i-1]) && flag == true)  {
      xsell[k] = NA[0][i];
      ysell[k] = NA[4][i];
      flag = false;
      k+=1;
    }
  }
  //最後一日，有買進但沒有賣出訊號時，以最後一天收盤價出場
  if ((flag == true) && (ybuy.length > ysell.length)) {
    xsell[k] = NA[0][i-1];
    ysell[k] = NA[4][i-1];
  }   
  //計算報酬率
  for (i = 0; i < ysell.length; i+=1) {
    roi[i] = (ysell[i] - ybuy[i]) / ybuy[i];
    sumroi += roi[i];
  } 
  result[0]=xbuy;
  result[1]=ybuy;
  result[2]=xsell;
  result[3]=ysell;
  result[4]=roi;
  console.log("roi =" + result[4]);
  console.log("sumroi = " + sumroi);
  document.getElementById("roi").innerHTML = "累計報酬率 = " + ((sumroi*100)).toFixed(4) + "%";
  console.log(result);
  return result;
}
//畫走勢圖
function drawplot(NumAry, buysellxy) {
  var col = NumAry[0].length;
  var trace1 = {
    type: 'scatter',
    x: NumAry[0], 
    y: NumAry[4],
    mode: 'lines',
    name: '收盤價', 
    line: {
      color: 'pansy',
      width: 1,
      dash: 'dot',
      smoothing: 0
    }
  };

  var trace2 = {
    type: 'scatter',
    x: NumAry[0], 
    y: NumAry[5],
    mode: 'lines',
    name: '5日均線(MA5)', 
    line: {
      color: 'blue',
      width: 1
    } 
  };
  
  var trace3 = {
    type: 'scatter',
    x: NumAry[0], 
    y: NumAry[6],
    mode: 'lines',
    name: '10日均線(MA10)', 
    line: {
      color: 'green',
      width: 1
    } 
  };
  var trace4 = {
    type: 'scatter',
    x: NumAry[0], 
    y: NumAry[7],
    mode: 'lines',
    name: '20日均線(MA20)', 
    line: {
      color: 'brown',
      width: 1
    } 
  };

var trace5 = {
  x: buysellxy[0],
  y: buysellxy[1],
  mode: 'markers+text',
  name: '買入點',
  textposition: 'top',
  type: 'scatter',
  marker: {
    color: 'red',
    size: 5,
    symbol: 'square'
  }   
};

var trace6 = {
  x: buysellxy[2],
  y: buysellxy[3],
  mode: 'markers+text',
  name: '賣出點',
  textposition: 'top',
  type: 'scatter',
  marker: {
    color: 'Black',
    size: 5,
    symbol: 'cross'
  } 
};

  var data = [trace1, trace2, trace3, trace4, trace5, trace6];
  var layout = {
    dragmode: 'zoom', 
    width: 800,
    height: 800,
    showlegend: true, 
    xaxis: {
      autorange: true, 
      range: ['2017-02-01', '2017-06-07'], 
      rangeslider: {range: ['2017-02-01', '2017-06-07']}, 
      title: 'Date', 
      type: 'date'
    }, 
    yaxis: {
      autorange: true, 
      domain: [0, 1], 
      range: [150, 200], 
      type: 'linear'
    }
  };
  Plotly.plot('output', data, layout);
}