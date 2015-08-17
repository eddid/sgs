var sgs = sgs || {};

var _ = sgs.func.format,
    filter = sgs.func.filter,
    exclude = sgs.func.exclude, 
    shuffle = sgs.func.shuffle,
    range = sgs.func.range,
    choice = sgs.func.choice,
    each = sgs.func.each,
    zip = sgs.func.zip,
    max = sgs.func.max,
    map = sgs.func.map;

(function(sgs){
    /* 通知 */
	sgs.uuid = "";
	sgs.eventNotifyAddCard = function(playerID, cards) {
		var cardIDs = "";
		each (cards, function(n, i) {
				cardIDs += " " + i.id;
			})
		if ("" != cardIDs) {
			sgs.eventNotify("adddowncard " + playerID + cardIDs);
		}
	};
	sgs.eventNotifyEquip = function(playerID, card, equipType, addOrRemove) {
		var precmd;
		if (addOrRemove) {
		    precmd = "add";
		} else {
		    precmd = "remove";
		}
		switch (equipType) {
		    case 0:
			    precmd += "weapon ";
			    break;
		    case 1:
			    precmd += "armor ";
			    break;
		    case 2:
			    precmd += "defensivehorse ";
			    break;
		    case 3:
			    precmd += "aggressivehorse ";
			    break;
			default:
			    return;
		}
		sgs.eventNotify(precmd + playerID + " " + card.id);
	};
    sgs.eventNotify = function(msg, successFunc, errorFunc, asyncOrNot) {
	    if (undefined = asyncOrNot) {
	        asyncOrNot = true;
		}
		$.ajax({
		    async: asyncOrNot,
			type: "POST",
			url: "clips_sgs?uuid=" + sgs.uuid,
			data: msg,
			dataType: "text",
			timeout: sgs.TIMEOUT, // in milliseconds
			success: function(result) {
				if (successFunc) {
				    successFunc(result);
				}
			},
			error: function(request, status, err) {
				if (errorFunc) {
				    errorFunc();
				}
			}
		});
    };

    sgs.Ai = function(bout, player, lv) {
        /* AI 解析对象
         * player: 扮演玩家对象
         * bout: 当前局
         * lv: AI难度 0, 1, 2; 简单,普通,困难
         * */
        this.player = player;
        this.bout = bout;
        this.lv = lv || bout.ailv;

        this.hassha = false; /* 当前玩家是否已出杀 */
    };
    sgs.Ai.interpreter = function(bout, opt) {

    };
    sgs.Ai.magic_weigh = { /* 锦囊牌权重 */
        "顺手牵羊": 5,
        "无中生有": 5,
        "南蛮入侵": 5,
        "万箭齐发": 5,
        "过河拆桥": 4,
        "决斗": 4,
        "借刀杀人": 3,
        "五谷丰登": 2,
        "桃园结义": 2,
        "乐不思蜀": 2,
        "无懈可击": 1,
        "闪电": 1,
    };
    sgs.Ai.identity_rela = { /* 身份之间敌对关系 (1 ~ 3) */
        /*主公*/
        0 : { 0 : 0,
              1 : 1,
              2 : 2,
              3 : 3 },
        /*忠臣*/
        1 : { 0 : 1,
              1 : 0,
              2 : 3,
              3 : 3 },
        /*内奸*/
        2 : { 0 : 2,
              1 : 3,
              2 : 0,
              3 : 3 },
        /*反贼*/
        3 : { 0 : 3,
              1 : 3,
              2 : 3,
              3 : 0 },
    };
    sgs.Ai.interpreter.attack_deviation = (function(rela_map){ return function(bout, plsrc) {
        /* 目前仅仅依据身份评判进攻对象 */
        var plsrc_iden = plsrc.identity,
            pls_rel = map(bout.player, function(i){ return rela_map[plsrc_iden][i.identity]; });

        return pls_rel; 
    } })(sgs.Ai.identity_rela);
    sgs.Ai.interpreter.magic_deviation = (function(magic_weigh, 
                                                   CARD_MAGIC_RANGE_MAPPING){ return function(bout, plsrc, pltar) {
        /* 使用锦囊决策 */
        var magic_cards = filter(plsrc.card, function(i) { return CARD_MAGIC_RANGE_MAPPING[i.name] &&
                                                                  i.name != "无懈可击"; }),
            be_use_card, be_use_card_weigh = -1, card_weigh, card_select_info;
        each(magic_cards, function(n, i){
            card_weigh = magic_weigh[i.name];
            if(be_use_card_weigh < card_weigh){
                card_select_info = bout.select_card(new sgs.Operate(i.name, plsrc, pltar, i));
                if (card_select_info[0].indexOf(pltar) != -1) {
                    be_use_card = i;
                    be_use_card_weigh = card_weigh;
                }
            }
        });
        return be_use_card; 
    } })(sgs.Ai.magic_weigh,
         sgs.CARD_MAGIC_RANGE_MAPPING);

    sgs.Ai.prototype.ask_card = (function(){ return function(opt) {
        var pl = this.player,
            bout = this.bout,
            cardname = opt.data,
            opt_top = this.bout.playOpts[bout.playOpts.length - 1];
        
        if(opt.id == "技能") {
            switch(cardname) {
                case "洛神":
                    return bout.response_card(new sgs.Operate("技能", pl, pl, "洛神"));
                case "鬼才":
                    return bout.response_card(new sgs.Operate("技能", pl, pl, false));
            }
        } else {
            switch(cardname) {
                case "无懈可击":
                    if(opt.source == pl && opt_top.target != pl) { /* 不无懈自己出的牌 */
                        return bout.response_card(new sgs.Operate(cardname, pl, pl, pl.findcard(cardname)));
                    }
                    break;
                case "桃":
                    if(opt.source == pl) { /* 自己 */
                        return bout.response_card(new sgs.Operate(cardname, pl, pl, pl.findcard(cardname)));
                    }
                    break;
                case "杀":
                case "闪":
                    return bout.response_card(new sgs.Operate(cardname, pl, opt.source, pl.findcard(cardname)));
            }
			//sgs.eventNotify("" , sgs.);
        }
        return bout.response_card(new sgs.Operate(cardname, pl, opt.source));
    } })();
    sgs.Ai.prototype.choose_card = (function(){ return function(opt) {
        var pl = this.player,
            bout = this.bout;

		var card = bout.choiceList.pop();
		
        pl.addcard(card);
		bout.notify("get_card", pl, [card]);
    } })();
    sgs.Ai.prototype.play_card = (function(attack_deviation, 
                                         magic_deviation,
                                         EQUIP_TYPE_MAPPING, 
                                         CARD_MAGIC_RANGE_MAPPING){ return function() {
        var pl = this.player,
            bout = this.bout,
            be_use_card;
		var thifRef = this;

        sgs.eventNotify("playcard " + pl.position, function(data) {
		    console.log(data);
			
			if ("" == data) {
                thifRef.drop_card();
				return;
			}
		    var result = data.split(' ');
			each(pl.card, function(n, i) {
				if (i.id == result[0]) {
					be_use_card = i;
					return false;
				}
			});
			var pltar = pl;
			if (result.length > 1) {
			    pltar = bout.player[parseInt(result[1])];
			}
			if (be_use_card) {
				bout.play_card(new sgs.Operate(be_use_card.name, pl, pltar, be_use_card));
			}
		}, function () {
		    thifRef.drop_card();
		});
    } })(sgs.Ai.interpreter.attack_deviation, 
         sgs.Ai.interpreter.magic_deviation,
         sgs.EQUIP_TYPE_MAPPING, 
         sgs.CARD_MAGIC_RANGE_MAPPING);

    sgs.Ai.prototype.drop_card = function() {
		var pl = this.player;
        var bout = this.bout;
		
        pl.status["hassha"] = false;
        /* 简单AI 啥也不做 */
        sgs.eventNotify("dropcard " + pl.position, function(data) {
		    console.log(data);
			
			if ("" == data) {
			    bout.drop_card(new sgs.Operate("弃牌", pl));
				return;
			}
		    var result = data.split(' ');
			var be_use_card = new Array();
			each(result, function(m, c) {
				each(pl.card, function(n, i) {
					if (i.id == c) {
						be_use_card.push(i);
					}
				});
			});
			if (be_use_card.length > 0) {
				bout.drop_card(new sgs.Operate("弃牌", pl, undefined, be_use_card));
			} else {
			    bout.drop_card(new sgs.Operate("弃牌", pl, undefined, choice(pl.card, pl.card.length - pl.blood)));
			}
		}, function () {
		    bout.drop_card(new sgs.Operate("弃牌", pl, undefined, choice(pl.card, pl.card.length - pl.blood)));
		});
    }; 
})(window.sgs);
