(function ($) {

    'use strict';
    //menu
    var dropdown = {};
    $('.menu')
        .on('dropdown-show', function (e) {
            dropdown.loadOnce($(this), dropdown.buildMenuItem);
        })
        .dropdown({
            css3: true,
            js: false
        });

    dropdown.buildMenuItem = function ($elem, data) {

        var html = "";
        if (data.length === 0) return;
        for (var i = 0; i < data.length; i++) {
            html += '<li><a href="' + data[i].url + '" target="_blank" class="menu-item">' + data[i].name + '</a></li>'
        }
        $elem.find('.dropdown-layer').html(html);

    };



    //header search
    var search = {};
    search.$headerSearch = $('#header-search');
    search.$headerSearch.html = '';
    search.$headerSearch.maxNum = 10;

    // 获得数据处理
    search.$headerSearch.on('search-getData', function (e, data) {
        var $this = $(this);
        search.$headerSearch.html = search.$headerSearch.createHeaderSearchLayer(data, search.$headerSearch.maxNum);
        $this.search('appendLayer', search.$headerSearch.html);
        // 将生成的html呈现在页面中        
        if (search.$headerSearch.html) {
            $this.search('showLayer');
        } else {
            $this.search('hideLayer');

        }
    }).on('search-noData', function (e) {
        // 没获得数据处理
        $(this).search('hideLayer').search('appendLayer', '');

    }).on('click', '.search-layer-item', function () {
        // 点击每项时，提交
        search.$headerSearch.search('setInputVal', $(this).html());
        search.$headerSearch.search('submit');
    });

    search.$headerSearch.search({
        autocomplete: true,
        css3: false,
        js: false,
        animation: 'fade',
        getDataInterval: 0
    });

    // 获取数据，生成html

    search.$headerSearch.createHeaderSearchLayer = function (data, maxNum) {
        var html = '',
            dataNum = data['result'].length;

        if (dataNum === 0) {
            return '';
        }
        for (var i = 0; i < dataNum; i++) {
            if (i >= maxNum) break;
            html += '<li class="search-layer-item text-ellipsis">' + data['result'][i][0] + '</li>';
        }
        return html;

    };

    // focus-category

    $('#focus-category').find('.dropdown')
        .on('dropdown-show', function () {
            dropdown.loadOnce($(this), dropdown.createCategoryDetails);
        })
        .dropdown({
            css3: false,
            js: false
        });

    dropdown.createCategoryDetails = function ($elem, data) {
        var html = '';
        for (var i = 0; i < data.length; i++) {
            html += '<dl class="category-details cf"><dt class="category-details-title fl"><a href="###" target="_blank" class="category-details-title-link">' + data[i].title + '</a></dt><dd class="category-details-item fl">';

            for (var j = 0; j < data[i].items.length; j++) {
                html += '<a href="###" target="_blank" class="link">' + data[i].items[j] + '</a>';
            }
            html += '</dd></dl>';
        }
        setTimeout(function () {
            $elem.find('.dropdown-layer').html(html);
        }, 1000);

    };

    dropdown.loadOnce = function ($elem, success) {
        var dataLoad = $elem.data('load');
        if (!dataLoad) return;
        if (!$elem.data('loaded')) {
            $elem.data('loaded', true);
            $.getJSON(dataLoad).done(function (data) {
                if (typeof success === 'function') success($elem, data);
            }).fail(function () {
                $elem.data('loaded', false);
            });
        }
    };

    // imgLoader
    var imgLoader = {};
    imgLoader.loadImg = function (url, imgLoaded, imgFailed) {
        var image = new Image();
        image.onerror = function () {
            if (typeof imgFailed === 'function') imgFailed(url);
        }
        image.onload = function () {
            if (typeof imgLoaded === 'function') imgLoaded(url);
        };

        setTimeout(function () {
            image.src = url;
        }, 1000);
    };

    imgLoader.loadImgs = function ($imgs, success, fail) {
        // var $imgs=$(elelm).find('.floor-img');          

        $imgs.each(function (_, el) { // _ 相当占位，不使用该参数。
            var $img = $(el);
            imgLoader.loadImg($img.data('src'), function (url) {
                $img.attr('src', url);
                success();
            }, function (url) {
                console.log('从' + url + '加载图片失败');
                // 多加载一次
                // 显示备用图片
                // $img.attr('src', 'img/floor/placeholder.png');
                fail($img, url);
            });
        });
    }

    //lazyLoad

    var lazyLoad = {};

    lazyLoad.loadUntil = function (options) {

        var items = {},
            loadedItemNum = 0,
            // totalItemNum = $floor.length,
            loadItemFn = null,
            $elem = options.$container,
            id = options.id
        // 什么时候开始加载
        $elem.on(options.triggerEvent, loadItemFn = function (e, index, elem) {
            // console.log(1);
            if (items[index] !== 'loaded') {
                $elem.trigger(id + '-loadItem', [index, elem, function () {
                    items[index] = 'loaded';
                    // console.log(items[index]);
                    loadedItemNum++;
                    console.log(index + ': loaded');
                    if (loadedItemNum === options.totalItemNum) {
                        // 全部加载完毕
                        $elem.trigger(id + '-itemsLoaded');
                    }
                }]);
            }
        });

        //加载中
        // $elem.on(id+'-loadItem', function(e, index, elem) {

        //        $elem.trigger(id+'-loadItems',[]);          

        //             items[index] = 'loaded';
        //             console.log(items[index]);
        //             loadedItemNum++;
        //             console.log(index + ': loaded');
        //             if (loadedItemNum === totalItemNum) {
        //                 // 全部加载完毕
        //                 $elem.trigger(id+'-itemsLoaded');
        //             }
        // });

        //加载完毕
        $elem.on(id + '-itemsLoaded', function (e) {
            console.log(id + '-itemsLoaded');
            // 清除事件
            $elem.off(options.triggerEvent, loadItemFn);
            // $win.off('scroll resize', timeToShow);
        });

    }

    lazyLoad.isVisible = function (offsetTop, height) {
        var $win = browser.$win;
        return ($win.height() + $win.scrollTop() > offsetTop) && ($win.scrollTop() < offsetTop + height)
    }


    // foucs-slider
    var slider = {};
    slider.$focusSlider = $('#focus-slider');

    slider.$focusSlider.on('focus-loadItem', function (e, index, elem, success) {

        imgLoader.loadImgs($(elem).find('.slider-img'), success, function ($img, url) {
            $img.attr('src', 'img/focus-slider/placeholder.png');
        });
    });

    lazyLoad.loadUntil({
        $container: slider.$focusSlider,
        totalItemNum: slider.$focusSlider.find('.slider-img').length,
        triggerEvent: 'slider-show',
        id: 'focus'
    });




    slider.$focusSlider.slider({
        css3: true,
        js: false,
        animation: 'fade', // fade  slide
        activeIndex: 0,
        interval: 1000
    });


    // todays-slider   
    slider.$todaysSlider = $('#todays-slider');

    slider.$todaysSlider.on('todays-loadItem', function (e, index, elem, success) {

        imgLoader.loadImgs($(elem).find('.slider-img'), success, function ($img, url) {
            $img.attr('src', 'img/todays-slider/placeholder.png');
        });
    });

    lazyLoad.loadUntil({
        $container: slider.$todaysSlider,
        totalItemNum: slider.$todaysSlider.find('.slider-img').length,
        triggerEvent: 'slider-show',
        id: 'todays'
    });

    slider.$todaysSlider.slider({
        css3: true,
        js: false,
        animation: 'fade', // fade  slide
        activeIndex: 0,
        interval: 0
    });



    //floor
    var floor = {};
    floor.$floor = $('.floor');


    floor.floorData = [{
        num: '1',
        text: '服装鞋包',
        tabs: ['大牌', '男装', '女装'],
        offsetTop: floor.$floor.eq(0).offset().top,
        height: floor.$floor.eq(0).height(),
        items: [
            [{
                name: '匡威男棒球开衫外套2015',
                price: 479
            }, {
                name: 'adidas 阿迪达斯 训练 男子',
                price: 335
            }, {
                name: '必迈BMAI一体织跑步短袖T恤',
                price: 159
            }, {
                name: 'NBA袜子半毛圈运动高邦棉袜',
                price: 65
            }, {
                name: '特步官方运动帽男女帽子2016',
                price: 69
            }, {
                name: 'KELME足球训练防寒防风手套',
                price: 4999
            }, {
                name: '战地吉普三合一冲锋衣',
                price: 289
            }, {
                name: '探路者户外男士徒步鞋',
                price: 369
            }, {
                name: '羽绒服2015秋冬新款轻薄男士',
                price: 399
            }, {
                name: '溯溪鞋涉水鞋户外鞋',
                price: 689
            }, {
                name: '旅行背包多功能双肩背包',
                price: 269
            }, {
                name: '户外旅行双肩背包OS0099',
                price: 99
            }],
            [{
                name: '匡威男棒球开衫外套2015',
                price: 479
            }, {
                name: 'adidas 阿迪达斯 训练 男子',
                price: 335
            }, {
                name: '必迈BMAI一体织跑步短袖T恤',
                price: 159
            }, {
                name: 'NBA袜子半毛圈运动高邦棉袜',
                price: 65
            }, {
                name: '特步官方运动帽男女帽子2016',
                price: 69
            }, {
                name: 'KELME足球训练防寒防风手套',
                price: 4999
            }, {
                name: '战地吉普三合一冲锋衣',
                price: 289
            }, {
                name: '探路者户外男士徒步鞋',
                price: 369
            }, {
                name: '羽绒服2015秋冬新款轻薄男士',
                price: 399
            }, {
                name: '溯溪鞋涉水鞋户外鞋',
                price: 689
            }, {
                name: '旅行背包多功能双肩背包',
                price: 269
            }, {
                name: '户外旅行双肩背包OS0099',
                price: 99
            }],
            [{
                name: '匡威男棒球开衫外套2015',
                price: 479
            }, {
                name: 'adidas 阿迪达斯 训练 男子',
                price: 335
            }, {
                name: '必迈BMAI一体织跑步短袖T恤',
                price: 159
            }, {
                name: 'NBA袜子半毛圈运动高邦棉袜',
                price: 65
            }, {
                name: '特步官方运动帽男女帽子2016',
                price: 69
            }, {
                name: 'KELME足球训练防寒防风手套',
                price: 4999
            }, {
                name: '战地吉普三合一冲锋衣',
                price: 289
            }, {
                name: '探路者户外男士徒步鞋',
                price: 369
            }, {
                name: '羽绒服2015秋冬新款轻薄男士',
                price: 399
            }, {
                name: '溯溪鞋涉水鞋户外鞋',
                price: 689
            }, {
                name: '旅行背包多功能双肩背包',
                price: 269
            }, {
                name: '户外旅行双肩背包OS0099',
                price: 99
            }]
        ]
    }, {
        num: '2',
        text: '个护美妆',
        tabs: ['热门', '国际大牌', '国际名品'],
        offsetTop: floor.$floor.eq(1).offset().top,
        height: floor.$floor.eq(1).height(),
        items: [
            [{
                name: '韩束红石榴鲜活水盈七件套装',
                price: 169
            }, {
                name: '温碧泉八杯水亲亲水润五件套装',
                price: 198
            }, {
                name: '御泥坊红酒透亮矿物蚕丝面膜贴',
                price: 79.9
            }, {
                name: '吉列手动剃须刀锋隐致护',
                price: 228
            }, {
                name: 'Mediheal水润保湿面膜',
                price: 119
            }, {
                name: '纳益其尔芦荟舒缓保湿凝胶',
                price: 39
            }, {
                name: '宝拉珍选基础护肤旅行四件套',
                price: 299
            }, {
                name: '温碧泉透芯润五件套装',
                price: 257
            }, {
                name: '玉兰油多效修护三部曲套装',
                price: 199
            }, {
                name: 'LOREAL火山岩控油清痘洁面膏',
                price: 36
            }, {
                name: '百雀羚水嫩倍现盈透精华水',
                price: 139
            }, {
                name: '珀莱雅新柔皙莹润三件套',
                price: 99
            }],
            [{
                name: '韩束红石榴鲜活水盈七件套装',
                price: 169
            }, {
                name: '温碧泉八杯水亲亲水润五件套装',
                price: 198
            }, {
                name: '御泥坊红酒透亮矿物蚕丝面膜贴',
                price: 79.9
            }, {
                name: '吉列手动剃须刀锋隐致护',
                price: 228
            }, {
                name: 'Mediheal水润保湿面膜',
                price: 119
            }, {
                name: '纳益其尔芦荟舒缓保湿凝胶',
                price: 39
            }, {
                name: '宝拉珍选基础护肤旅行四件套',
                price: 299
            }, {
                name: '温碧泉透芯润五件套装',
                price: 257
            }, {
                name: '玉兰油多效修护三部曲套装',
                price: 199
            }, {
                name: 'LOREAL火山岩控油清痘洁面膏',
                price: 36
            }, {
                name: '百雀羚水嫩倍现盈透精华水',
                price: 139
            }, {
                name: '珀莱雅新柔皙莹润三件套',
                price: 99
            }],
            [{
                name: '韩束红石榴鲜活水盈七件套装',
                price: 169
            }, {
                name: '温碧泉八杯水亲亲水润五件套装',
                price: 198
            }, {
                name: '御泥坊红酒透亮矿物蚕丝面膜贴',
                price: 79.9
            }, {
                name: '吉列手动剃须刀锋隐致护',
                price: 228
            }, {
                name: 'Mediheal水润保湿面膜',
                price: 119
            }, {
                name: '纳益其尔芦荟舒缓保湿凝胶',
                price: 39
            }, {
                name: '宝拉珍选基础护肤旅行四件套',
                price: 299
            }, {
                name: '温碧泉透芯润五件套装',
                price: 257
            }, {
                name: '玉兰油多效修护三部曲套装',
                price: 199
            }, {
                name: 'LOREAL火山岩控油清痘洁面膏',
                price: 36
            }, {
                name: '百雀羚水嫩倍现盈透精华水',
                price: 139
            }, {
                name: '珀莱雅新柔皙莹润三件套',
                price: 99
            }]
        ]
    }];




    floor.buildFloor = function (floorData) {
        var html = '';

        html += '<div class="container">';
        html += floor.buildFloorHead(floorData);
        html += floor.buildFloorBody(floorData);
        html += '</div>';

        return html;
    };

    floor.buildFloorHead = function (floorData) {
        var html = '';
        html += '<div class="floor-head">';
        html += '<h2 class="floor-title fl"><span class="floor-title-num">' + floorData.num + 'F</span><span class="floor-title-text">' + floorData.text + '</span></h2>';
        html += '<ul class="tab-item-wrap fr">';
        for (var i = 0; i < floorData.tabs.length; i++) {
            html += '<li class="fl"><a href="javascript:;" class="tab-item">' + floorData.tabs[i] + '</a></li>';
            if (i !== floorData.tabs.length - 1) {
                html += '<li class="floor-divider fl text-hidden">分隔线</li>';
            }
        }
        html += '</ul>';
        html += '</div>';
        return html;
    };

    floor.buildFloorBody = function (floorData) {
        var html = '';
        html += '<div class="floor-body">';
        for (var i = 0; i < floorData.items.length; i++) {
            html += '<ul class="tab-panel">';
            for (var j = 0; j < floorData.items[i].length; j++) {
                html += '<li class="floor-item fl">';
                html += '<p class="floor-item-pic"><a href="###" target="_blank"><img src="img/floor/loading.gif" class="floor-img" data-src="img/floor/' + floorData.num + '/' + (i + 1) + '/' + (j + 1) + '.jpg" alt="" /></a></p>';
                html += '<p class="floor-item-name"><a href="###" target="_blank" class="link">' + floorData.items[i][j].name + '</a></p>';
                html += '<p class="floor-item-price">' + floorData.items[i][j].price + '</p>';
                html += '</li>';
            }

            html += '</ul>';
        }

        html += '</div>';

        return html;
    };

    var browser = {};

    browser.$win = $(window);
    browser.$doc = $(document);



    floor.timeToShow = function () {
        console.log('time to show');
        floor.$floor.each(function (index, elem) {
            if (lazyLoad.isVisible(floor.floorData[index].offsetTop, floor.floorData[index].height)) {
                // console.log('the'+(index+1)+'floor is visible');
                browser.$doc.trigger('floor-show', [index, elem]);
            }
        });
    }

    browser.$win.on('scroll resize', floor.showFloor = function () {
        clearTimeout(floor.floorTimer);
        floor.floorTimer = setTimeout(floor.timeToShow, 250);
    });

    floor.$floor.on('floor-loadItem', function (e, index, elem, success) {

        imgLoader.loadImgs($(elem).find('.floor-img'), success, function ($img, url) {
            $img.attr('src', 'img/floor.placeholder.png');
        });
    });

    browser.$doc.on('floors-loadItem', function (e, index, elem, success) {

        var html = floor.buildFloor(floor.floorData[index]),
            $elem = $(elem);
        success();
        // setTimeout(function() {
        $elem.html(html);
        lazyLoad.loadUntil({
            $container: $elem,
            totalItemNum: $elem.find('.floor-img').length,
            triggerEvent: 'tab-show',
            id: 'floor'
        });
        $elem.tab({
            event: 'mouseenter', // mouseenter或click
            css3: false,
            js: false,
            animation: 'fade',
            activeIndex: 0,
            interval: 0,
            delay: 0
        });

        // }, 1000);
    });

    browser.$doc.on('floors-itemsLoaded', function () {
        browser.$win.off('scroll resize', floor.showFloor);
    });

    lazyLoad.loadUntil({
        $container: browser.$doc,
        totalItemNum: floor.$floor.length,
        triggerEvent: 'floor-show',
        id: 'floors'
    });

    floor.timeToShow();


    // elevator
    floor.whichFloor = function () {
        var num = -1;

        floor.$floor.each(function (index, elem) {
            var floorData = floor.floorData[index];

            num = index;

            if (browser.$win.scrollTop() + browser.$win.height() / 2 < floorData.offsetTop) {
                num = index - 1;
                return false;
            }
        });

        return num;
    };
    console.log(floor.whichFloor());

    floor.$elevator = $('#elevator');
    floor.$elevator.$items = floor.$elevator.find('.elevator-item');
    floor.setElevator = function () {
        var num = floor.whichFloor();

        if (num === -1) { // hide
            floor.$elevator.fadeOut();
        } else { // show
            floor.$elevator.fadeIn();
            floor.$elevator.$items.removeClass('elevator-active');
            floor.$elevator.$items.eq(num).addClass('elevator-active');
        }
    };

    floor.setElevator();

    browser.$win.on('scroll resize', function () {
        clearTimeout(floor.elevatorTimer);
        floor.elevatorTimer = setTimeout(floor.setElevator, 250);
    });

    floor.$elevator.on('click', '.elevator-item', function () {
        $('html, body').animate({
            scrollTop: floor.floorData[$(this).index()].offsetTop
        });
    });



    $('#backToTop').on('click', function () {
        $('html, body').animate({
            scrollTop: 0
        });
    });
    // footer
    var bottomData = [{
        'title': '消费者保障',
        'items': ['保障范围', '退换货流程', '服务中心', '更多特色服务']
    }, {
        'title': '新手上路',
        'items': ['新手专区', '消费警示', '交易安全', '24小时在线帮助', '免费开店']
    }, {
        'title': '付款方式',
        'items': ['快捷支付', '信用卡', '余额包', '蜂蜜花啊', '货到付款']
    }, {
        'title': '慕淘特色',
        'items': ['手机慕淘', '慕淘信', '大众评审', 'B格指南']
    }]

    var footData = {
        'link': ['关于慕淘', '合作伙伴', '营销中心', '廉正举报', '联系客服', '开放平台', '诚征英才', '联系我们', '网站地图', '法律声明', '知识产权'],
        'copyright': '&copy;2020 imooc.com All Rights Reserved'
    }


    function footHtml() {
        var html = '<div class="tags">';

        for (var i = 0; i < footData['link'].length; i++) {
            html += '<a href="javascript:;">' + footData['link'][i] + '</a>';
        }
        html += '</div><div class="copyright">' + footData['copyright'] + '</div>'
        return html;
    }

    function footNavHtml() {
        var html = '';

        for (var i = 0; i < bottomData.length; i++) {

            html += '<div class="nav_content"><p class="a=nav_title">' + bottomData[i]['title'] + '</p>';
            for (var j = 0; j < bottomData[i]['items'].length; j++) {
                html += '<a href="javascript:;">' + bottomData[i]['items'][j] + '</a>'
            }
            html += '</div>'
        }
        return html;
    }

    function isVisible($elem) {
        return ($(window).height() + $(window).scrollTop() > $elem.offset().top) && ($elem.offset().top + $elem.height() > $(window).scrollTop())
    }

    var download = {};

    function timeToShow($elem, callback) {


        if (isVisible($elem)) {
            $elem.find('.container').html(callback())
            download[$elem] = 'loaded';
        };
    }

    $(window).on('scroll resize', function () {
        timeToShow($('.foot_nav'), footNavHtml)
    })
    $(window).on('scroll resize', function () {
        timeToShow($('.foot'), footHtml)
    })

    timeToShow($('.foot_nav'), footNavHtml);
    timeToShow($('.foot'), footHtml)

})(jQuery);