let dataUri
const makeblob = function (dataURL) {
    var BASE64_MARKER = ';base64,';
    if (dataURL.indexOf(BASE64_MARKER) == -1) {
        var parts = dataURL.split(',');
        var contentType = parts[0].split(':')[1];
        var raw = decodeURIComponent(parts[1]);
        return new Blob([raw], { type: contentType });
    }
    var parts = dataURL.split(BASE64_MARKER);
    var contentType = parts[0].split(':')[1];
    var raw = window.atob(parts[1]);
    var rawLength = raw.length;

    var uInt8Array = new Uint8Array(rawLength);

    for (var i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
    }

    return new Blob([uInt8Array], { type: contentType });
}
 /**
 * 入力欄とか、画像やJSONを表示する要素を取得しておく
 */ 
document.getElementById('inputImage').addEventListener('change', function (e) {
    // 1枚だけ表示する
    var file = e.target.files[0];

    // ファイルリーダー作成
    var fileReader = new FileReader();
    fileReader.onload = function() {
        // Data URIを取得
        dataUri = this.result;

        // img要素に表示
        var img = document.getElementById('sourceImage');
        img.src = dataUri;
        
    }

    // ファイルをData URIとして読み込む
    fileReader.readAsDataURL(file);
});

const inputImage = document.getElementById("inputImage")
const displayImage = document.getElementById("sourceImage")
const displayJson = document.getElementById("responseTextArea")
console.log(inputImage);
/**
 * ボタンを押したときに実行される関数。
 * htmlの15行目でonclickに書いている。
 * <button onclick="processImage()">Analyze face</button>
 */
const processImage = ()=>{

    /**
     * アクセス先のURLを作る。
     * URLにはクエリパラメータをつけることができ、これにより解析条件の細かい設定ができる。
     */
    const uriBase ="https://japaneast.api.cognitive.microsoft.com/face/v1.0/detect";
    const params = {
        "returnFaceId": "true",
        "returnFaceLandmarks": "false",
        "returnFaceAttributes": [
            "age","gender","headPose",
            "smile","facialHair","glasses",
            "emotion","hair","makeup",
            "occlusion","accessories","blur",
            "exposure","noise"
        ].join(',')
    };
    // Object.keys〜以降は上のparamsをもとにクエリパラメータを作っている。よくわからなくても大丈夫。
    const url = uriBase + '?' + Object.keys(params).map(key => `${key}=${params[key]}`).join('&')


    /**
     * データを送信する。
     * 結果がかえってきたらthen以下に処理が進む。
     * この辺も今度詳しく説明します。
     */
    const subscriptionKey = "de4c06c4cec141b688f2f9c62363cf39";
    fetch(url, {
        method: 'POST',
        headers: {
            "Content-Type": "application/octet-stream",
            "Ocp-Apim-Subscription-Key": subscriptionKey,
            processData: false,
        },
        body: makeblob(dataUri)
    })
    .then((res) => res.json())
    .then((data)=>{
        // 取得したJSONを表示
        displayJson.value = JSON.stringify(data, null, 2)
        graph(data);
    })
    .catch(console.log)
};

const graph = (data)=>{
//グラフ化
//レーダーチャート
const happyRate  = Math.round(data[0].faceAttributes.emotion.happiness * 100);
const sadRate    = Math.round(data[0].faceAttributes.emotion.sadness * 100);
const angryRate  = Math.round(data[0].faceAttributes.emotion.anger * 100);
const exciteRate = Math.round(data[0].faceAttributes.emotion.surprise * 100);
const relaxRate  = Math.round(data[0].faceAttributes.emotion.neutral * 100);
  
var ctx = document.getElementById("myRaderChart");
var myRadarChart = new Chart(ctx, {
    type: 'radar',
    data: {
        labels: ["HAPPY", "SAD", "ANGRY", "EXCITE", "RELAX"],
        datasets: [{
            label: 'YOUR EMOTION',
            data: [happyRate, sadRate, angryRate, exciteRate, relaxRate],
            backgroundColor: 'RGBA(225,95,150, 0.5)',
            borderColor: 'RGBA(225,95,150, 1)',
            borderWidth: 1,
            pointBackgroundColor: 'RGB(46,106,177)'
        }]
    },
    options: {
        title: {
            display: true,
            text: 'THIS PICTUREs　EMOTION'
        },
        scale:{
            ticks:{
                suggestedMin: 1,
                suggestedMax: 30,
                stepSize: 5,
                callback: function(value, index, values){
                    return  value +  ""
                }
            }
        }
    }
});

//棒グラフ
var ctx = document.getElementById("myBarChart");
  var myBarChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ["HAPPY", "SAD", "ANGRY", "EXCITE", "RELAX"],
      datasets: [
        {
          label: 'YOUR EMOTION',
          data: [Math.round(data[0].faceAttributes.emotion.happiness * 100),
                 Math.round(data[0].faceAttributes.emotion.sadness * 100),
                 Math.round(data[0].faceAttributes.emotion.anger * 100), 
                 Math.round(data[0].faceAttributes.emotion.surprise * 100), 
                 Math.round(data[0].faceAttributes.emotion.neutral * 100)],
          backgroundColor: "rgba(219,39,91,0.5)"
        }
      ]
    },
    options: {
      title: {
        display: true,
        text: 'YOUR EMOTION GRAGH'
      },
      scales: {
        yAxes: [{
          ticks: {
            suggestedMax: 30,
            suggestedMin: 1,
            stepSize: 5,
            callback: function(value, index, values){
              return  value
            }
          }
        }]
      },
    }
  });

  //円グラフ
  var ctx = document.getElementById("myPieChart");
  var myPieChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ["HAPPY", "SAD", "ANGRY", "EXCITE", "RELAX"],
      datasets: [{
          backgroundColor: [
              "yellow",
              "blue",
              "red",
              "pink",
              "green"
          ],
          data: [Math.round(data[0].faceAttributes.emotion.happiness * 100),
                 Math.round(data[0].faceAttributes.emotion.sadness * 100),
                 Math.round(data[0].faceAttributes.emotion.anger * 100), 
                 Math.round(data[0].faceAttributes.emotion.surprise * 100), 
                 Math.round(data[0].faceAttributes.emotion.neutral * 100)]
      }]
    },
    options: {
      title: {
        display: true,
        text: 'YOUR EOMTION'
      }
    }
  });
};
