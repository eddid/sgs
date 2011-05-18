var sgs = sgs || {};
sgs.PLAYER_NUM = 4;


(function(sgs){
    var srd = Math.random;
    sgs.func = sgs.func || {};
    sgs.func.rint = function(max) {
        max = max || 100;
        return srd() * max | 0;
    };
    sgs.func.shuffle = function(list) {
        var llen = list.length, 
            newlist = [],
            cur = 0,
            rint = sgs.func.rint;
        for(; cur < llen; cur++) {
            newlist.splice(rint(cur), 0, list[cur]);
        }
        return newlist;
    };
    sgs.func.choice = function(list, num) {
        var llen = list.length,
            choiced = []
            num = num || 1,
            tmp = -1,
            rint = sgs.func.rint;
        if(llen < num) {
            throw new Error("choice num can't more then list length");
        }
        if(num * 2 <= llen) {
            while(choiced.length < num) {
                tmp = rint(llen);
                if(choiced.indexOf(list[tmp]) == -1) {
                    choiced.push(list[tmp]);
                }
            }
        } else {
            choiced = choiced.concat(sgs.func.shuffle(list));
            choiced = choiced.splice(llen - num);
        }
        return choiced;
    };
    sgs.func.range = function(num, func) {
        if(func) {
            var i = 0;
            while(i < num) {
                if(func(i++) == false) {
                    return ;
                }
            }
        } else {
            var i = 0, slist = [];
            for(; i < num; i++) {
                slist.push(i);
            }
            return slist;
        };
    };
    sgs.func.each = function(list, func) {
        var llen = list.length,
            cur = 0;
        for(;cur < llen; cur++) {
            if(func(cur, list[cur], llen) == false)
                return;
        }
    };

    /*
     * 回合操作对象
     * 主要负责和界面交互,以及提供AI计算环境
     * */
    sgs.bout = function(player) {
        /* 回合 */
        if(player.length > sgs.PLAYER_NUM) {
            throw new Error("不能超过" + sgs.PLAYER_NUM + "名玩家");
        }

        this.log = []; /* 操作日志 */
        this.start_time = new Date(); /* 局开始时间 */
        this.player = player;/* 玩家 */
        this.curplayer = 0;/* 当前执行玩家 */
        var ccard = sgs.func.shuffle(sgs.CARD);
        this.card = ccard; /* 已经洗过的卡 */
        this.opt_stack = []; /* 操作堆栈 */

        /* 开局初始化 */
        sgs.func.range(player.length, function(i) {
            /* 初始化发牌 */
            sgs.func.range(4, function(ii) {
                player[i].card.push(ccard.shift());
            });
        });
    };
    sgs.bout.get_identity = function(player_num) {
        return sgs.func.shuffle(sgs.IDENTITY_MAPPING[player_num]);
    };
    sgs.bout.get_hero = function(player_num, heros) {
        heros = heros || sgs.HERO;
        return sgs.func.choice(heros, player_num); 
    };

    sgs.bout.prototype.init = function() {
        /* 开局初始化 */
        sgs.func.range(this.player.length, function(i) {
            /* 初始化发牌 */
            sgs.func.range(4, function(ii) {
                this.player[i].card.push(this.card.shift());
            });
        });
    };
    sgs.bout.prototype.ishero = function(hero) {
        var pls = this.player, i = pls.length;
        while(i-- > 0) {
            if(pls[i].hero.name == hero.name) {
                return pls[i];
            }
        }
        return undefined;
    };
    
    sgs.bout.prototype.next = function(opt) {
        /* 进行下一步操作 */
        
    };
    
    /*
     * 玩家对象
     * */
    sgs.player = function(nickname, identity, hero, isAI) {
        /* 玩家 */ 
        /*
         * nickname : 昵称
         * identity : 身份
         * hero : 英雄
         * isAI : 是否为AI控制
         */
        this.nickname = nickname;
        this.identity = identity;
        this.hero = hero;
        this.isAI = isAI || false;
        this.card = [];
    };
    
    /*
     * 英雄对象
     * */
    sgs.hero = function(name, life, skills, country) {
        /* 英雄 */
        /*
         * name : 英雄名称
         * life : 生命值,对应可用派数.
         * skill : 技能
         * country : 所属国.
         */
        this.name = name;
        this.life = life;
        this.skills = skills;
        this.country = country;        
    };

    /*
     * 卡牌对象
     * */
    sgs.card = function(name, color, digit) {
        /* 卡牌 */
        /*
         * name : 名称
         * color : 花色 (0 : 方块, 1 : 红桃, 2 : 梅花, 3 : 黑桃)
         * digit : 牌字 (A, 2, 3 ... 10, J, Q, K)
         * 操作 : 操作对象
         */
        this.name = name;
        this.color = color;
        this.digit = digit;
    };

    sgs.operate = function(id, source, target) {
        /*
         * 操作对象
         * id : 操作标示
         * source : 操作来源 (hero)
         * target : 操作目标 (hero)
         * */

        this.id = id;
        this.source = source;
        this.target = target;
    };
    
    sgs.interpreter = function(bout, opt) {
        /* 操作解释器 */
        
    };


    var slist = [];
    sgs.func.each(sgs.HERO, function(n, i) {
        slist.push(new sgs.hero(i[0], i[1], i[2], i[3]));
    });
    sgs.HERO = slist;

    slist = [];
    sgs.func.each(sgs.CARD, function(n, i) {
        slist.push(new sgs.card(i["name"], i["color"], i["digit"]));
    });
    sgs.CARD = slist;

    var toString = function() {
        var tmp = "",
            i;
        for(i in this) {
            if(this.hasOwnProperty(i)) {
                tmp += " " + i + ":" + this[i] +"; ";
            }
        }
        return tmp;
    },
        glass = [sgs.player, sgs.hero, sgs.operate, sgs.card], glen = glass.length;
    while(glen-- > 0) {
        glass[glen].prototype.toString = toString;
    }
})(window.sgs);
