
function myAxios(config) {
    return new Promise(function (resolve, reject) {
        const url = config.url + (config.params ? '?' + new URLSearchParams(config.params).toString() : '');
        const xhr = new XMLHttpRequest();
        xhr.open(config.method || 'GET', url);
        xhr.addEventListener('loadend', function () {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve(JSON.parse(xhr.responseText));          // 成功：响应体解析成对象交出去
            } else {
                const err = new Error('请求失败，状态码：' + xhr.status);
                err.status = xhr.status;                        // 记住状态码，方便对 400 单独提示
                reject(err);
            }
        });
        if (config.data) {
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(JSON.stringify(config.data));
        } else {
            xhr.send();
        }
    });
}

/* ------------- 2. 城市名 -> 城市编码（来源：民政部行政区划代码） ------------- */
// 格式：6 位编码 + 城市名，逗号分隔
const CITY_CODE_TEXT =
    '110100北京市,120100天津市,130100石家庄市,130200唐山市,130300秦皇岛市,130400邯郸市,130500邢台市,130600保定市,130700张家口市,130800承德市,130900沧州市,131000廊坊市,131100衡水市,140100太原市,140200大同市,140300阳泉市,140400长治市,140500晋城市,140600朔州市,140700晋中市,140800运城市,140900忻州市,141000临汾市,141100吕梁市,150100呼和浩特市,150200包头市,150300乌海市,150400赤峰市,150500通辽市,150600鄂尔多斯市,150700呼伦贝尔市,150800巴彦淖尔市,150900乌兰察布市,152200兴安盟,152500锡林郭勒盟,152900阿拉善盟,210100沈阳市,210200大连市,210300鞍山市,210400抚顺市,' +
    '210500本溪市,210600丹东市,210700锦州市,210800营口市,210900阜新市,211000辽阳市,211100盘锦市,211200铁岭市,211300朝阳市,211400葫芦岛市,220100长春市,220200吉林市,220300四平市,220400辽源市,220500通化市,220600白山市,220700松原市,220800白城市,222400延边朝鲜族自治州,230100哈尔滨市,230200齐齐哈尔市,230300鸡西市,230400鹤岗市,230500双鸭山市,230600大庆市,230700伊春市,230800佳木斯市,230900七台河市,231000牡丹江市,231100黑河市,231200绥化市,232700大兴安岭地区,310100上海市,320100南京市,320200无锡市,320300徐州市,320400常州市,320500苏州市,320600南通市,320700连云港市,' +
    '320800淮安市,320900盐城市,321000扬州市,321100镇江市,321200泰州市,321300宿迁市,330100杭州市,330200宁波市,330300温州市,330400嘉兴市,330500湖州市,330600绍兴市,330700金华市,330800衢州市,330900舟山市,331000台州市,331100丽水市,340100合肥市,340200芜湖市,340300蚌埠市,340400淮南市,340500马鞍山市,340600淮北市,340700铜陵市,340800安庆市,341000黄山市,341100滁州市,341200阜阳市,341300宿州市,341400巢湖市,341500六安市,341600亳州市,341700池州市,341800宣城市,350100福州市,350200厦门市,350300莆田市,350400三明市,350500泉州市,350600漳州市,350700南平市,350800龙岩市,' +
    '350900宁德市,360100南昌市,360200景德镇市,360300萍乡市,360400九江市,360500新余市,360600鹰潭市,360700赣州市,360800吉安市,360900宜春市,361000抚州市,361100上饶市,370100济南市,370200青岛市,370300淄博市,370400枣庄市,370500东营市,370600烟台市,370700潍坊市,370800济宁市,370900泰安市,371000威海市,371100日照市,371200莱芜市,371300临沂市,371400德州市,371500聊城市,371600滨州市,371700菏泽市,410100郑州市,410200开封市,410300洛阳市,410400平顶山市,410500安阳市,410600鹤壁市,410700新乡市,410800焦作市,410900濮阳市,411000许昌市,411100漯河市,411200三门峡市,' +
    '411300南阳市,411400商丘市,411500信阳市,411600周口市,411700驻马店市,419001济源市,420100武汉市,420200黄石市,420300十堰市,420500宜昌市,420600襄阳市,420700鄂州市,420800荆门市,420900孝感市,421000荆州市,421100黄冈市,421200咸宁市,421300随州市,422800恩施土家族苗族自治州,429004仙桃市,429005潜江市,429006天门市,430100长沙市,430200株洲市,430300湘潭市,430400衡阳市,430500邵阳市,430600岳阳市,430700常德市,430800张家界市,430900益阳市,431000郴州市,431100永州市,431200怀化市,431300娄底市,433100湘西土家族苗族自治州,440100广州市,440200韶关市,440300深圳市,440400珠海市,' +
    '440500汕头市,440600佛山市,440700江门市,440800湛江市,440900茂名市,441200肇庆市,441300惠州市,441400梅州市,441500汕尾市,441600河源市,441700阳江市,441800清远市,441900东莞市,442000中山市,445100潮州市,445200揭阳市,445300云浮市,450100南宁市,450200柳州市,450300桂林市,450400梧州市,450500北海市,450600防城港市,450700钦州市,450800贵港市,450900玉林市,451000百色市,451100贺州市,451200河池市,451300来宾市,451400崇左市,460100海口市,460200三亚市,460300三沙市,460400儋州市,469001五指山市,469002琼海市,469005文昌市,469006万宁市,469007东方市,500100重庆市,' +
    '510100成都市,510300自贡市,510400攀枝花市,510500泸州市,510600德阳市,510700绵阳市,510800广元市,510900遂宁市,511000内江市,511100乐山市,511300南充市,511400眉山市,511500宜宾市,511600广安市,511700达州市,511800雅安市,511900巴中市,512000资阳市,513200阿坝藏族羌族自治州,513300甘孜藏族自治州,513400凉山彝族自治州,520100贵阳市,520200六盘水市,520300遵义市,520400安顺市,520500毕节市,520600铜仁市,522300黔西南布依族苗族自治州,522600黔东南苗族侗族自治州,522700黔南布依族苗族自治州,530100昆明市,530300曲靖市,530400玉溪市,530500保山市,530600昭通市,530700丽江市,530800普洱市,530900临沧市,' +
    '532300楚雄彝族自治州,532500红河哈尼族彝族自治州,532600文山壮族苗族自治州,532800西双版纳傣族自治州,532900大理白族自治州,533100德宏傣族景颇族自治州,533300怒江傈僳族自治州,533400迪庆藏族自治州,540100拉萨市,540200日喀则市,540300昌都市,540400林芝市,540500山南市,540600那曲市,542500阿里地区,610100西安市,610200铜川市,610300宝鸡市,610400咸阳市,610500渭南市,610600延安市,610700汉中市,610800榆林市,610900安康市,611000商洛市,620100兰州市,620200嘉峪关市,620300金昌市,620400白银市,620500天水市,620600武威市,620700张掖市,620800平凉市,620900酒泉市,621000庆阳市,621100定西市,621200陇南市,' +
    '622900临夏回族自治州,623000甘南藏族自治州,630100西宁市,630200海东市,632200海北藏族自治州,632300黄南藏族自治州,632500海南藏族自治州,632600果洛藏族自治州,632700玉树藏族自治州,632800海西蒙古族藏族自治州,640100银川市,640200石嘴山市,640300吴忠市,640400固原市,640500中卫市,650100乌鲁木齐市,650200克拉玛依市,650400吐鲁番市,650500哈密市,652300昌吉回族自治州,652700博尔塔拉蒙古自治州,652800巴音郭楞蒙古自治州,652900阿克苏地区,653000克孜勒苏柯尔克孜自治州,653100喀什地区,653200和田地区,654000伊犁哈萨克自治州,654200塔城地区,654300阿勒泰地区,659001石河子市,659002阿拉尔市,659003图木舒克市,659004五家渠市,' +
    '659005北屯市,659006铁门关市,659007双河市,659008可克达拉市,659009昆玉市,659010胡杨河市,659011新星市,659012白杨市';
const CITY_CODES = Object.fromEntries(CITY_CODE_TEXT.split(',').map(function (s) {
    return [s.slice(6), s.slice(0, 6)];                         // '210200大连市' -> ['大连市', '210200']
}));

// 城市名/编码 -> 6 位编码（支持「大连」「大连市」「210200」）
function getCityCode(name) {
    const n = String(name || '').trim();
    if (/^\d{6}$/.test(n)) return n;
    return CITY_CODES[n] || CITY_CODES[n.endsWith('市') ? n : n + '市'] || '';
}

/* --------------------------- 3. 提示 + 天气请求 --------------------------- */
const WEATHER_API = 'http://hmajax.itheima.net/api/weather';    // 天气接口（只认编码）
const CITY_API = 'http://hmajax.itheima.net/api/city';          // 省份查城市（只返回名字）

function tip(msg) {
    console.log('[天气]', msg);
    const box = document.getElementById('ajaxTip');
    if (box) { box.textContent = msg; box.style.display = msg ? 'block' : 'none'; }
}

// 按编码查天气并渲染（name 只用于提示文案）
function getWeather(code, name) {
    const label = name || code;
    tip('正在查询「' + label + '」的天气...');
    return myAxios({ url: WEATHER_API, params: { city: code } })
        .then(function (res) {
            renderWeather(toTodayView(res.data));               // 先切成「今天」视图（日期+实况+标签），再渲染
            tip('已切换到「' + res.data.area + '」的天气');
            return res.data;
        })
        .catch(function (err) {
            console.error('天气查询失败:', err);
            tip(err.status === 400
                ? '天气接口里暂时查不到「' + label + '」的数据，换一个城市试试'
                : '天气查询失败：' + err.message);
            return null;
        });
}

// 按城市名（或编码）查天气：下拉点选、输入框回车都走这里
function loadCityWeather(nameOrCode) {
    const code = getCityCode(nameOrCode);
    if (!code) {
        tip('没找到「' + nameOrCode + '」的城市编码，可以直接输入 6 位城市编码（例如 210200 = 大连市）');
        return Promise.resolve(null);
    }
    return getWeather(code, nameOrCode);
}

let TODAY_VIEW = true;

function toTodayView(w) {
    if (!TODAY_VIEW || !w || !w.dayForecast) return w;

    const now = new Date();
    const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const apiDay = new Date(String(w.date).replace(/-/g, '/'));      // 接口数据的第一天
    const offset = Math.round((todayDate - apiDay) / 86400000);      // 接口数据比本机今天早几天
    if (offset <= 0) return w;                                      // 接口就是当天数据，什么都不用改

    const list = w.dayForecast;
    const today = list[offset];                                     // 「今天」那一格
    if (!today) return w;                                           // 接口没覆盖到今天，就不动

    const two = n => (n < 10 ? '0' + n : '' + n);
    const WEEK = '日一二三四五六';

    // 1) 头部日期 + 顶部实况都换成今天的
    w.dateShort = today.date || (two(now.getMonth() + 1) + '月' + two(now.getDate()) + '日');
    w.temperature = today.temDay;                                   // 大温度用今天的最高温
    w.weather = today.weather;
    w.windDirection = today.windDirection;
    w.windPower = today.windPower;
    w.todayLabel = '今天';
    w.todayWeather = Object.assign({}, w.todayWeather, {            // 今日详情里能拆出来的也换今天的
        weather: today.weather,
        temDay: today.temDay,
        temNight: today.temNight
    });

    // 2) 7 天列表：日期保持接口原值，标签按本机今天重标
    list.forEach(function (d, i) {
        const gap = i - offset;                                      // 这一天离「今天」几天
        if (gap === -1) d.dateFormat = '昨天';
        else if (gap === 0) d.dateFormat = '今天';
        else if (gap === 1) d.dateFormat = '明天';
        else if (gap === 2) d.dateFormat = '后天';
        else {
            const m = String(d.date).match(/^(\d{2})月(\d{2})日$/);
            if (m) d.dateFormat = '周' + WEEK[new Date(apiDay.getFullYear(), Number(m[1]) - 1, Number(m[2])).getDay()];
        }
    });
    return w;
}

function renderWeather(w) {
    const t = w.todayWeather || {};
    const set = function (selector, html) {
        const el = document.querySelector(selector);
        if (el) el.innerHTML = html;                            // 页面上没有这个元素就自动跳过
    };

    // 农历不再显示：接口给的 dateLunar 是它自己那天的农历，和校正后的日期对不上
    set('.date-info', `<span class="dateShort">${w.dateShort || w.date}</span>`);
    set('.location', `📍 ${w.area}`);
    set('.big-temp', `${w.temperature}<span>°</span>`);
    set('.air-quality', `${w.psPm25} ${w.psPm25Level}`);
    set('.wind-info span:last-child', `${w.windDirection} ${w.windPower}`);   // 接口的 windPower 自带「级」
    set('.today-details', `
        <span>${w.todayLabel || '今天'}: ${w.weather} ${t.temNight}~${t.temDay}℃</span>
        <span>紫外线 ${t.ultraviolet || '—'}</span>
        <span>湿度 ${t.humidity}%</span>
        <span>日出 ${t.sunriseTime}</span>
        <span>日落 ${t.sunsetTime}</span>`);

    const list = document.querySelector('.forecast-list');
    if (!list || !w.dayForecast) return;
    list.innerHTML = w.dayForecast.map(function (d) {
        return `<div class="forecast-item">
            <div class="day-text">${d.dateFormat || d.date}</div>
            <div class="date-text">${d.date}</div>
            <div class="weather-icon">${weatherIcon(d.weather)}</div>
            <div class="weather-text">${d.weather}</div>
            <div class="temp-text">${d.temNight}~${d.temDay}℃</div>
            <div class="wind-text">${d.windDirection} ${d.windPower}</div>
        </div>`;
    }).join('');
}

// 天气文字 -> emoji 图标
function weatherIcon(weather) {
    if (weather.includes('晴')) return '☀️';
    if (weather.includes('阴')) return '☁️';
    if (weather.includes('雨')) return '🌧️';
    if (weather.includes('雪')) return '❄️';
    return '⛅';
}

/* ------------------------- 5. 搜索联想下拉菜单 ------------------------- */
// 页面上没有 #dropdownMenu 就自动建一个（只加在 JS 里，不动你的 HTML/CSS）
function getMenu(input) {
    let menu = document.getElementById('dropdownMenu');
    if (menu) return menu;

    const style = document.createElement('style');
    style.textContent =
        '#dropdownMenu{display:none;position:absolute;z-index:99;left:0;right:0;margin:6px 0 0;padding:6px 0;' +
        'list-style:none;background:#fff;border:1px solid #e5e7eb;border-radius:10px;' +
        'box-shadow:0 8px 20px rgba(0,0,0,.12);max-height:240px;overflow-y:auto}' +
        '#dropdownMenu.show{display:block}' +
        '#dropdownMenu .dropdown-item{padding:8px 14px;font-size:14px;color:#333;cursor:pointer}' +
        '#dropdownMenu .dropdown-item:hover{background:#f2f6ff;color:#1a73e8}';
    document.head.appendChild(style);

    menu = document.createElement('ul');
    menu.id = 'dropdownMenu';
    const parent = (input && input.parentElement) || document.body;
    parent.style.position = 'relative';                         // 让下拉相对搜索框定位
    parent.appendChild(menu);
    return menu;
}

// 输入省份/关键字 -> 查城市列表 -> 渲染下拉 -> 点城市名就换天气
function searchCity(keyword, input) {
    return myAxios({ url: CITY_API, params: { pname: keyword } })
        .then(function (res) {
            const menu = getMenu(input);
            const list = res.list || [];
            menu.innerHTML = list.length
                ? list.map(function (city) { return `<li class="dropdown-item">${city}</li>`; }).join('')
                : '<li class="dropdown-item" style="color:#999;cursor:default">未找到相关城市</li>';
            menu.classList.add('show');

            menu.querySelectorAll('.dropdown-item').forEach(function (item) {
                item.addEventListener('click', function () {
                    if (input) input.value = item.textContent;  // 回填搜索框
                    menu.classList.remove('show');
                    loadCityWeather(item.textContent);          // 切换整页天气
                });
            });
            return list;
        })
        .catch(function (err) {
            console.error('查询城市失败:', err);
            return [];
        });
}

/* ------------------------- 6. 页面初始化 ------------------------- */
// 等 DOM 准备好再执行（script 写在 head 或 body 都行）
function ready(fn) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', fn);
    } else {
        fn();
    }
}

ready(function () {
    // 搜索框（天气查询.html 里是 class="search-box"；#searchInput 是你的原写法，一起兼容）
    const input = document.getElementById('searchInput') || document.querySelector('input.search-box');
    if (input) {
        let timer = null;                                       // 防抖用

        // 输入时：停 300ms 再查城市列表（避免每敲一个字都发请求）
        input.addEventListener('input', function () {
            clearTimeout(timer);
            const keyword = input.value.trim();
            if (!keyword) return;
            timer = setTimeout(function () { searchCity(keyword, input); }, 300);
        });

        // 回车：已知城市/编码 -> 直接换天气；否则当省份/关键字查候选城市
        input.addEventListener('keydown', function (e) {
            if (e.key !== 'Enter') return;
            e.preventDefault();
            const value = input.value.trim();
            if (!value) return;
            getMenu(input).classList.remove('show');
            if (getCityCode(value)) loadCityWeather(value);
            else searchCity(value, input);
        });

        // 点页面空白处收起下拉
        document.addEventListener('click', function (e) {
            const menu = document.getElementById('dropdownMenu');
            if (menu && !input.contains(e.target) && !menu.contains(e.target)) menu.classList.remove('show');
        });
    }

    // 进页面先显示北京市的天气（上海 310100、大连 210200 ...）
    getWeather('110100', '北京市');
});
