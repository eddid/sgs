var sgs = sgs || {};

(function(sgs){
    var slice = Array.prototype.slice,
        splice = Array.prototype.splice,
        copy = function(ary){ return slice.apply(ary); },
        _ = sgs.func.format,
        filter = sgs.func.filter,
        exclude = sgs.func.exclude, 
        shuffle = sgs.func.shuffle,
        range = sgs.func.range,
        choice = sgs.func.choice,
        each = sgs.func.each,
        map = sgs.func.map,
        and = sgs.func.and,
        or = sgs.func.or,
        sub = sgs.func.sub;

    /*
     * 玩家对象
     * */
    sgs.Player = function(nickname, identity, hero, isAI, position) {
        /* 玩家 */ 
        /*
         * nickname : 昵称
         * identity : 身份
         * hero : 英雄
         * isAI : 是否为AI控制
		 * position : 位置序号
         */
        this.nickname = nickname;
        this.identity = identity;
        this.hero = hero;
        this.isAI = isAI || false;
		this.position = position;
        this.AI = undefined; 
        this.card = [];

		this.maxblood = hero.life; /* 玩家最大生命值 */
		/*if (sgs.IDENTITY_LORD == identity) {
		    this.maxblood++;
		}*/
        this.blood = this.maxblood; /* 玩家当前生命值 */
        this.lebusishu_decision = undefined; /* 被施展的延迟技能:乐不思蜀 */
        this.lightning_decision = undefined; /* 被施展的延迟技能:闪电 */
        this.equip = []; /* 装备, 0:武器, 1:防具, 2:+1马, 3:-1马 */
        this.status = {}; /* 临时状态 */
    };
    sgs.Player.prototype.range = function() {
        var attack = 0, defend = 0, equip = this.equip;
        attack = equip[0] ? sgs.EQUIP_RANGE_MAPPING[equip[0].name] : 1;
        attack += equip[3] ? 1 : 0;
        defend += equip[2] ? 1 : 0;
        return [attack, defend];
    };
    sgs.Player.prototype.skill = function(skill_name) {
        return this.hero.skills.indexOf(skill_name) != -1;
    };
    sgs.Player.prototype.hascard = function(name) {
        var has = false;
        each(this.card, function(n, i){
            if (i.name == name) {
                has = true;
                return false;
            }
        });
        return has;
    };
    sgs.Player.prototype.findcard = function(name) {
        var result = undefined;
        each(this.card, function(n, i){
            if(i.name == name) {
                result = i;
                return false;
            }
        });
        return result;
    };
    sgs.Player.prototype.rmcard = function(cards) {
        var target_pos;
        if (!cards) {
            return false;
        }
		var cardIDs = "";
		if (cards instanceof sgs.Card) {
			target_pos = this.card.indexOf(cards);
			if (target_pos != -1) {
				this.card.splice(target_pos, 1);
				cardIDs = " " + cards.id;
			}
		} else if (cards instanceof Array) {
			for (var i = 0; i < cards.length; i++) {
				target_pos = this.card.indexOf(cards[i]);
				if (target_pos != -1) {
					this.card.splice(target_pos, 1);
					cardIDs = " " + cards[i].id;
				}
			}
		}
		if ("" != cardIDs) {
			sgs.eventNotify("removecard " + this.position + cardIDs);
		    return true;
		}
        return false;
    };
    sgs.Player.prototype.addcard = function(cards) {
        if (!cards) {
            return false;
        }
		var cardIDs = "";
		if (cards instanceof sgs.Card) {
			this.card.push(cards);
			cardIDs = " " + cards.id;
		} else if (cards instanceof Array) {
			this.card = this.card.concat(cards);
			each (cards, function(n, i) {
				cardIDs += " " + i.id;
			})
		}
		if ("" != cardIDs) {
			sgs.eventNotify("adddowncard " + this.position + cardIDs);
			return true;
		}
        return false;
    };
    sgs.Player.prototype.choose_card = function(opt) {
	    var bout = sgs.interface.bout;
        if(this.isAI) {
            this.AI.choose_card(opt);
			/* 为下一玩家选牌作准备 */
			if (bout.playOpts.length > 0) {
				var next_opt = bout.playOpts[bout.playOpts.length - 1];
				sgs.interpreter.ask_wuxie(bout, next_opt.target);
			}
			bout.continue();
			return;
        }
		sgs.interface.Show_CardChooseBox(
			'选择您的牌',
			bout.choiceList);
    };
    sgs.Player.prototype.ask_card = function(opt) {
        if(!this.isAI) throw new Error("sorry ! I'm computer.");
        
        this.AI.ask_card(opt);
    };
    sgs.Player.prototype.play_card = function(opt) {
        if(!this.isAI) throw new Error("sorry ! I'm computer.");

        this.AI.play_card(opt);
    };
    sgs.Player.prototype.drop_card = function(opt) {
        if(!this.isAI) throw new Error("sorry ! I'm computer.");

        this.AI.drop_card(opt);
    };
    
    /*
     * 英雄对象
     * */
    sgs.Hero = function(name, life, skills, country, gender, nickname) {
        /* 英雄 */
        /*
         * name : 英雄名称
         * life : 生命值,对应可用派数.
         * skill : 技能
         * country : 所属国.
         * gender : 性别.
		 * nickname : 别名,拼音名称
         */
        this.name = name;
        this.life = life;
        this.skills = skills;
        this.country = country;        
        this.gender = gender;
		this.nickname = nickname;
    };

    /*
     * 卡牌对象
     * */
    sgs.Card = function(name, color, digit, id) {
        /* 卡牌 */
        /*
         * name : 名称
         * color : 花色 (0 : 方块, 1 : 红桃, 2 : 梅花, 3 : 黑桃)
         * digit : 牌字 (A, 2, 3 ... 10, J, Q, K)
		 * id    : universal id with sgs_clips
         * enable : 是否可用
         */
        this.name = name;
        this.color = color;
        this.digit = digit;
		this.id = id;
        this.enable = true;
    };

    sgs.Operate = function(id, source, target, data) {
        /*
         * 操作对象
         * id : 操作标示
         * source : 操作来源 (player)
         * target : 操作目标 (player)
         * data :  操作中的额外数据
         * */

        this.id = id;
        this.source = source;
        this.target = target || undefined;
        this.data = data || undefined;
    };

    sgs.HERO = map(sgs.HERO, function(i){ return new sgs.Hero(i[0], i[1], i[2], i[3], i[4], i[5]); });
    sgs.CARD = map(sgs.CARD, function(i){ return new sgs.Card(i["name"], i["color"], i["digit"], i["id"]); });

    var toString = function() {
        var tmp = "{",
            i;
        for(i in this) {
            if(this.hasOwnProperty(i)) {
                tmp += _("{0}: {1}, ", i, this[i]);
            }
        }
        return tmp + "}";
    },
        glass = [sgs.Player, sgs.Hero, sgs.Operate, sgs.Card];
    each(glass, function(n, i) {
        i.prototype.toString = toString;
    });

    /*
     * 回合操作对象
     * 主要负责和界面交互,以及提供AI计算环境
     * */
    sgs.Bout = function(player, ailv) {
        /* 回合 */
        if(player.length > sgs.PLAYER_NUM) {
            throw new Error("can't more than " + sgs.PLAYER_NUM + " players.");
        }

        var _bufflog = [], 
            king = null,
            king_pos = -1,
            ccard = shuffle(sgs.CARD);

        each(player, function(n, i) { if (i.identity == sgs.IDENTITY_LORD) { king_pos = n; king = i; return false; } });
        if ((player.length >= 4) && (null != king)) { /* 超过四位玩家,主公血量+1 */
            king.blood++;
            king.maxblood++;
        }
        
        _bufflog.push("游戏开始:");
        _bufflog.push("所有玩家身份已分配.");
        _bufflog.push(_("主公{0}({1})出牌.", king.hero.name, king.nickname));

        this._bufflog = _bufflog; /* 当前操作日志 */
        this._log = []; /* 操作日志 */
        this.start_time = new Date(); /* 局开始时间 */
        this.ailv = ailv || sgs.DEFAULT_AI_LV;
        this.player = player;/* 玩家 */
        this.playerlen = player.length;
        this.curplayer = king_pos;/* 当前执行玩家 */
        this.card = ccard; /* 已经洗过的卡 */
        this.playOpts = []; /* 出牌操作堆栈 */
        this.replyOpts = []; /* 应答牌队列 */
        this.choiceList = []; /* (五谷丰登)选牌队列 */
		this.stage = sgs.STAGE_JUDGE; /* 当前执行状态 */
        this.attached = {}; /* 绑定的事件 */
        this.last_judge_card; /* 上一张判定牌 */
		this.wuxie_count = 0; /* 记录本回合无懈可击的次数 */
        
        this.timer = 0;

        /* 开局初始化 */
        range(player.length, function(i) {
		    /* 通知sgs_clips服务器 */
		    var pl = player[i];
			sgs.eventNotify("setplayer " + i + " " + sgs.IDENTITY_INDEX_MAPPING.pinyin[pl.identity] + " " + pl.hero.nickname + " " + pl.blood);

            /* 初始化发牌 */
			pl.addcard(ccard.splice(0, 4));
        });
        /* 转入主公控制 */
        setTimeout((function(obj){ return function(){
            each(obj.player, function(n, i) {
                if(i.isAI) {
                    i.AI = new sgs.Ai(obj, i);  
                }
            });
            obj.continue();
        } })(this), 16);
    };
    sgs.Bout.get_identity = function(player_num) {
        return shuffle(sgs.IDENTITY_MAPPING[player_num]);
    };
    sgs.Bout.get_hero = function(player_num, heros) {
        heros = heros || sgs.HERO;
        return choice(heros, player_num); 
    };
    sgs.Bout.get_king_hero = function(other_num, heros) {
        other_num = other_num || 2;
        heros = heros || sgs.HERO;
        alway_king = filter(sgs.HERO, function(i) { return i.name == "曹操" || 
                                                           i.name == "刘备" ||
                                                           i.name == "孙权"; });
        heros = exclude(choice(heros, other_num + 3),  function(i) { return i.name == "曹操" || 
                                                                            i.name == "刘备" ||
                                                                            i.name == "孙权"; });
        return alway_king.concat(heros.slice(0, 2));
    };

    sgs.Bout.prototype.get_buff_log = function() {
        var result = this._bufflog.slice(0);
        this._log = this._log.concat(this._bufflog);
        this._bufflog = []; 
        return result;
    };
    sgs.Bout.prototype.attach = function(even_type, func) {
        if(!this.attached[even_type]) {
            this.attached[even_type] = [];
        }
        this.attached[even_type].push(func);
    };
    sgs.Bout.prototype.notify = function(event_type) {
        var args = slice.call(arguments, 1);
        if(this.attached[event_type]) {
            each(this.attached[event_type], function(n, i) {
                i.apply({}, args);
            });
        }
    };
    sgs.Bout.prototype.ishero = function(hero) {
        var pls = this.player, i = pls.length;
        while(i-- > 0) {
            if(pls[i].hero.name == hero.name) {
                return pls[i];
            }
        }
        return undefined;
    };
    sgs.Bout.prototype.hero_range = function(pl, plrange) {
        /* 获得英雄所能攻击得到的范围 */
        var result = [], 
            distance = 0,
            pls = this.player,
            plpos = pl.position, 
            plrange = plrange || pl.range()[0];

        each(pls, function(n, i) {
            if (plpos == i.position) {
                return;
            } else if (plpos < i.position) {
                distance = Math.min(i.position - plpos, plpos + pls.length - i.position);
            } else {
                distance = Math.min(plpos - i.position, i.position + pls.length - plpos);
            }
            distance = distance + (i.equip[2] ? 1 : 0); /* 有+1马还需要加1 */
            if(plrange >= distance) {
                result.push(i);
            }
        });
        return result;
    };
    sgs.Bout.prototype.next_player = function(pl) {
        var pls = this.player;
        return pls[(pls.indexOf(pl) + 1) % this.playerlen];
    };
    sgs.Bout.prototype.prev_player = function(pl) {
        var pls = this.player,
            plpos = pls.indexOf(pl) - 1;
        plpos = plpos < 0 ? (this.playerlen-1) : plpos;
        return pls[plpos];
    };
    sgs.Bout.prototype.live_body_identity = function(){
        return map(this.player, function(i){ return i.blood > 0 ? i.identity : -1 ; });
    };
    sgs.Bout.prototype.judge = (function(judge){ return function() {
        var result = judge(this); 
        if (result) { /* GAME OVER */
            console.log(result["winner"][0].nickname, result["msg"]);
            return false;
        }
        return true;
    } })(sgs.interpreter.judge);
	sgs.Bout.prototype.realcontinue = (function () { return function() {
		    var bout = this;
            if (bout.replyOpts.length > 0) {
                var opt = bout.replyOpts[bout.replyOpts.length-1],
                    pltar = opt.target;

                pltar.ask_card(opt);
            } else if (bout.playOpts.length > 0) {
                var opt = bout.playOpts[bout.playOpts.length-1];

                sgs.interpreter.action_execute(bout, opt);
            } else if (bout.judge()) {
				switch(bout.stage) {
					case sgs.STAGE_JUDGE:
						return bout.decision();
					case sgs.STAGE_GET_CARD:
						return bout.get_card();
					case sgs.STAGE_PLAY_CARD:
						return bout.play_card();
					case sgs.STAGE_DROP_CARD:
						return bout.player[bout.curplayer].drop_card();
				}
            }
        } })();
    sgs.Bout.prototype.continue = (function(DELAY, response_card){ return function() {
        setTimeout((function(bout){ return function() {
            if (bout.replyOpts.length > 0) {
                var opt = bout.replyOpts[bout.replyOpts.length-1],
                    pltar = opt.target;

                pltar.ask_card(opt);
            } else if (bout.playOpts.length > 0) {
                var opt = bout.playOpts[bout.playOpts.length-1];

                sgs.interpreter.action_execute(bout, opt);
            } else if (bout.judge()) {
				switch(bout.stage) {
					case sgs.STAGE_JUDGE:
						return bout.decision();
					case sgs.STAGE_GET_CARD:
						return bout.get_card();
					case sgs.STAGE_PLAY_CARD:
						return bout.play_card();
					case sgs.STAGE_DROP_CARD:
						return bout.player[bout.curplayer].drop_card();
				}
            }
        } })(this), DELAY); } })(sgs.DELAY, sgs.interpreter.response_card);
    
    sgs.Bout.prototype.decision = (function(decision){ return function(opt) {
        /* 判定 */
        var pl = this.player[this.curplayer];

        /** 甄姬-洛神 **/
        if(pl.hero.name == "甄姬" && (pl.status["zhenji.luoshen"] | 0) != -1) {
            pl.status["zhenji.luoshen"] = (pl.status["zhenji.luoshen"] | 0) + 1;
            this.replyOpts.push(new sgs.Operate("技能", pl, pl, "洛神"));
            return this.continue();
        }
        /** end-洛神 **/

		/** 判定-闪电 **/
        if (pl.lightning_decision) {
		    var opt = pl.lightning_decision;
			pl.lightning_decision = null;
			sgs.eventNotify("removelightning " + pl.position + " " + opt.data.id);
            return decision(this, pl, opt); 
        }
		/** 判定-乐不思蜀 **/
        if (pl.lebusishu_decision) {
		    var opt = pl.lebusishu_decision;
			pl.lebusishu_decision = null;
			sgs.eventNotify("removelebusishu " + pl.position + " " + opt.data.id);
            return decision(this, pl, opt); 
        }

        this.stage = sgs.STAGE_GET_CARD;
        this.continue();
    } })(sgs.interpreter.decision);
    sgs.Bout.prototype.get_card = function(opt) {
        /* 摸牌 */
        var pl = this.player[this.curplayer],
            num = 2;

        /** 张辽-奇袭 **/
        /** end-奇袭 **/
        
        if(this.card.length < 5) { this.card = this.card.concat(shuffle(sgs.CARD)); }
        
        var cards = this.card.splice(0, num);
        //cards[0].name = "无懈可击";
        //cards[1].name = "乐不思蜀";

        console.log(pl.nickname, "摸牌", map(cards, function(i) {return i.name; }));
        pl.addcard(cards);
        console.log(pl.nickname, "手牌:", map(pl.card, function(i) {return i.name; }));
        this.notify("get_card", pl, cards);
        
        if(pl.status["lebusishu"]) {
            console.log("中乐了.休息一下");
            this.stage = sgs.STAGE_DROP_CARD;
        } else {
            this.stage = sgs.STAGE_PLAY_CARD;
        }
        this.continue();
    };
    sgs.Bout.prototype.select_card = (function(select_card){ return function(opt) {
        /* 选牌 */
        var pl = opt.source,
            card = opt.data;

        return select_card(this, opt);
    } })(sgs.interpreter.select_card);

    sgs.Bout.prototype.choose_card = (function(choose_card, response_card, EQUIP_TYPE_MAPPING){ return function(opt) {
        var pl = opt.source,
            card = opt.data;

        //if (card && (card instanceof sgs.Card)) { /* 移除所用卡牌 */
        //    if (!pl.rmcard(card)) {
        //        throw new Error("有没有搞错!明明都用过这牌了!你以为电脑是好欺负的?");
        //        return ;
        //    }
        //}
        choose_card(this, opt);

    } })(sgs.interpreter.choose_card, 
         sgs.interpreter.response_card,
         sgs.EQUIP_TYPE_MAPPING ); 

	sgs.Bout.prototype.remove_card = function(opt) {
        var pl = opt.source,
            cards = opt.data;
		
        pl.rmcard(cards);
    };
	
    sgs.Bout.prototype.response_card = (function(response_card){ return function(opt) {
        this.remove_card(opt);
        response_card(this, opt);
    } })(sgs.interpreter.response_card);

    sgs.Bout.prototype.play_card = (function(play_card){ return function(opt) {
		if(!opt) { /* 未选好牌,去选牌 */
            this.player[this.curplayer].play_card();
        } else { /* 已选好牌,直接出 */
			this.remove_card(opt);
			play_card(this, opt);
		}
    } })(sgs.interpreter.play_card); 

    sgs.Bout.prototype.drop_card = function(opt) {
        /* 弃牌 */
        var pl = this.player[this.curplayer];
        
        if (pl.blood < pl.card.length) {
            var cards = opt && opt.data;
            if (!cards) {
                return new sgs.Operate("弃牌", undefined, pl, pl.card.length - pl.blood);
            } else {
			    this.remove_card(opt);
            }
            console.log(pl.nickname, "弃牌", map(cards, function(i) { return i.name; }));
            this.notify("drop_card", pl, cards);
        }
		console.log(pl.nickname, "弃牌了");

        pl.status = {};
        
        setTimeout((function(bout){ return function(){
			while (true) {
				bout.curplayer++;

				if(bout.curplayer >= bout.playerlen) { 
					bout.timer++;
					if (bout.timer > 30) {
						console.log("GAME OVER"); 
						return ;
					}
				}

				bout.curplayer %= bout.playerlen;
				pl = bout.player[bout.curplayer]
				if (pl.blood > 0) {
					break;
				}
			}
			bout.stage = sgs.STAGE_JUDGE;
            bout.continue();
        } })(this), 50);
    };

})(window.sgs);
