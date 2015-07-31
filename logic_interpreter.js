var sgs = sgs || {};

(function(sgs){
    var _ = sgs.func.format,
        each = sgs.func.each,
        exclude = sgs.func.exclude,
        filter = sgs.func.filter,
        any = sgs.func.any,
        copy = function(ary) { return Array.prototype.slice.apply(ary); };

    /* 操作解释器 */
    sgs.interpreter = function(bout, opt) {
        commend = sgs.commend_mapping[opt.id];
        if(commend == undefined) {
            throw new Error("5555, i'm not strong enough operate " + opt.id);
        }
        return commend(bout, opt);
    };
    sgs.interpreter.select_card = function(bout, opt) {
        var pl = opt.source,
            card = opt.data,
            choiceable_pl = [],
            choiceable_num = 0;
			
		if (card instanceof Array) {
			card = card[0];
		}
        if (sgs.EQUIP_TYPE_MAPPING[card.name] != undefined) {
            choiceable_pl = [pl];
            choiceable_num = 0;
        } else {
            switch(card.name) {
                case "杀":
                    choiceable_pl = bout.hero_range(pl);
                    choiceable_num = 1;
                    break;
                case "闪":
                    choiceable_pl = [pl];
                    choiceable_num = 1;
                    break;
                case "桃":
                    choiceable_pl = [pl];
                    choiceable_num = 0;
                    break;
                case "无中生有":
                case "闪电":
                    choiceable_pl = [pl];
                    choiceable_num = 0;
                    break;
                case "顺手牵羊":
                    if(pl.hero.name == "黄月英") { 
                        choiceable_pl = copy(bout.player);
                        choiceable_num = 1;
                    } else {
                        choiceable_pl = bout.hero_range(pl, pl.equip[3] ? 2 : 1);
                        choiceable_num = 1;
                    } 
                    break;
                case "借刀杀人":
                    choiceable_pl = filter(bout.player, function(i) { return !!i.equip[1]; });
                    choiceable_num = 2;
                    break;
                case "决斗":
                case "过河拆桥":
                    choiceable_pl = copy(bout.player);
                    choiceable_num = 1;
                    break;
                case "乐不思蜀":
                    choiceable_pl = filter(bout.player, 
                                           function(i){ return !any(i.be_decision, 
                                                                    function(ii){ return ii.id == "乐不思蜀" ; }); });
                    choiceable_num = 1;
                    break;
                case "五谷丰登":
                case "桃园结义":
                    choiceable_pl = copy(bout.player);
                    choiceable_num = 0;
				    break;
                case "南蛮入侵":
                case "万箭齐发":
                    choiceable_pl = filter(bout.player, function(i) { return pl != i; });
                    choiceable_num = 0;
				    break;
                case "无懈可击":
                    choiceable_pl = copy(bout.player);
                    choiceable_num = -1;
                    break;
            }
        }
        return [choiceable_pl, choiceable_num];
    };

    sgs.interpreter.ask_wuxie = function(bout, pltar) {
        /*
         * 为锦囊询问无懈可击
         * bout: sgs.Bout
         * pltar_pos: 目标对象所在Bout.player位置
         * */
        var pls = bout.player,
            plslen = bout.playerlen,
            pltar_pos = pltar.position,
            pl_has_the_card,
            has_wuxie,
            may_wuxie = false;
        range(plslen, function(n) {
            pl_has_the_card = pls[(pltar_pos + n) % plslen];
			if (pl.blood < 1) {
				return ;
			}
            has_wuxie = pl_has_the_card.findcard("无懈可击");
            if (has_wuxie) {
                may_wuxie = true;
                console.log(_("{0} 向 {1} 求无懈", pltar.nickname, pl_has_the_card.nickname));
                bout.replyOpts.push(new sgs.Operate("无懈可击", pltar, pl_has_the_card, "无懈可击")); 
            }
        });
		bout.wuxie_count = 0;
        return may_wuxie;
    };

    sgs.interpreter.ask_peach = function(bout, plsrc, pltar) {
        /*
         * 向其他对象求桃
         * bout: sgs.Bout
         * plsrc: 临死对象
         * pltar: 造成伤害对象
         * */
        var pltar_pos = pltar.position, 
            save_opt = [];
        range(bout.playerlen, function(n) {  /* 临死求救 */
            console.log(":向", bout.player[(pltar_pos+n)%bout.playerlen].nickname, "求救中.");
            save_opt.push(new sgs.Operate("桃", 
                                             plsrc,
                                             bout.player[(pltar_pos+n)%bout.playerlen]));
        });
        bout.replyOpts = save_opt;
    };

    sgs.interpreter.ask_guicai = function(bout, plsrc, card) {
        var plsrc_pos = plsrc.position,
            that_pl,
            result = false;
		bout.last_judge_card = card;
        range(bout.playerlen, function(n) { /* 判定时改判 */    
            that_pl = bout.player[(plsrc_pos+n)%bout.playerlen];
            if(that_pl.skill("鬼才")) {
                console.log(":向", that_pl.nickname, "求改判.");
                result = true;
                bout.replyOpts.push(new sgs.Operate("技能", plsrc, that_pl, "鬼才"));
                return false;
            }
        });
        return result;
    };

    sgs.interpreter.action_execute = (function(ask_peach, ask_wuxie, ask_guicai){ return function(bout, opt) {
        var plsrc = opt.source,
            pltar = opt.target,
            card = opt.data;
		var judge_card;
		var need_continue = true;

		if (card instanceof Array) {
			card = card[0];
		}
		
        if(opt.id == "技能") {
            switch(card) {
                case "洛神":
					if (null == bout.last_judge_card) {
					    judge_card = bout.card.shift();
                        bout.notify("skill", "洛神", pltar, judge_card, judge_card.color < 2);
						if (ask_guicai(bout, pltar, judge_card)) {
						    return need_continue;
						}
					} else {
					    judge_card = bout.last_judge_card;
					}
                    if (judge_card.color < 2) {
                        pltar.status["zhenji.luoshen"] = -1;
                    } else {
                        pltar.card.push(judge_card);
                        console.log(_("{0} 发动了技能洛神,获得 {1}", pltar.nickname, judge_card.name));
                    }
                    break;
            }
        } else {
            switch(card.name) {
                case "乐不思蜀":
					if (null == bout.last_judge_card) {
					    judge_card = bout.card.shift();
                        bout.notify("judge_card", pltar, judge_card);
						if (ask_guicai(bout, pltar, judge_card)) {
						    return;
						}
					} else {
					    judge_card = bout.last_judge_card;
					}
                    console.log(card.name, "判定,花色:", judge_card.color, "数字:", judge_card.digit);
                    if (judge_card.color != 1) {
                        pltar.status["lebusishu"] = true;
                    }
                    break;
                case "无中生有": 
				    bout.playOpts.pop();
                    var cards = bout.card.splice(0, 2);
                    bout.notify("get_card", pltar, cards);
                    console.log(pltar.nickname, "获得", cards);
                    pltar.card = pltar.card.concat(cards);
                    break;
                case "闪电":
					if (null == bout.last_judge_card) {
					    judge_card = bout.card.shift();
                        bout.notify("judge_card", pltar, judge_card);
						if (ask_guicai(bout, pltar, judge_card)) {
						    return need_continue;
						}
					} else {
					    judge_card = bout.last_judge_card;
					}
                    console.log("闪电判定--", judge_card.color);
                    if (judge_card.color == 3 && judge_card.digit >= 2 && judge_card.digit <= 9) { 
                        pltar.blood -= 3;
                        bout.notify("get_damage", pltar);
                        console.log(_("天要下雨,娘要嫁人.你这福分,有幸三生.坑爹阿,遭雷劈啦!"));
                        if (pltar.blood < 1) {
                            ask_peach(bout, pltar, plsrc);  
                        }
                    }
                    break;
				case "五谷丰登":
				    /* 让pltar选择一张牌 */
					bout.playOpts.pop();
					pltar.choose_card(opt);
					need_continue = false;
					break;
				case "桃园结义":
					bout.playOpts.pop();
                    if (pltar.blood < pltar.maxblood) {
                        pltar.blood++;
                        bout.notify("get_cure", pltar);
                        console.log(_("{0} 恢复一滴血,还剩下{1}滴血", pltar.nickname, pltar.blood));
                    }
					/* 为下一玩家选牌作准备 */
					if (bout.playOpts.length > 0) {
						var next_opt = bout.playOpts[bout.playOpts.length - 1];
						ask_wuxie(bout, next_opt.target);
					}
					bout.continue();
					need_continue = false;
					break;
				case "南蛮入侵":
					/* 为下一玩家选牌作准备 */
					if (bout.playOpts.length > 1) {
						var next_opt = bout.playOpts[bout.playOpts.length - 2];
						ask_wuxie(bout, next_opt.target);
					}
				    bout.replyOpts.push(new sgs.Operate("杀", plsrc, pltar, "杀"));
					bout.continue();
					need_continue = false;
					break;
				case "万箭齐发":
					/* 为下一玩家选牌作准备 */
					if (bout.playOpts.length > 1) {
						var next_opt = bout.playOpts[bout.playOpts.length - 2];
						ask_wuxie(bout, next_opt.target);
					}
				    bout.replyOpts.push(new sgs.Operate("闪", plsrc, pltar, "闪"));
					bout.continue();
					need_continue = false;
					break;
				case "借刀杀人":
				    bout.playOpts.pop();
					break;
				case "决斗":
				    bout.replyOpts.push(new sgs.Operate("杀", plsrc, pltar, "杀"));
					break;
				case "顺手牵羊":
				    bout.playOpts.pop();
					break;
				case "过河拆桥":
				    bout.playOpts.pop();
					if (pltar.card.length > 0) {
					    var rmcard = pltar.card[0];
						pltar.rmcard(rmcard);
						bout.notify("drop_card", pltar, rmcard);
					}
					break;
            }
        }
		return need_continue;
    } })(sgs.interpreter.ask_peach, sgs.interpreter.ask_wuxie, sgs.interpreter.ask_guicai);

    sgs.interpreter.response_card = (function(action_execute, ask_peach){ return function(bout, opt) {
        /* 用户相应南蛮,万箭,临死求桃等动作时出的卡牌 */
        var plsrc = opt.source,
            pltar = opt.target,
            card = opt.data,
            opt_top = bout.playOpts[bout.playOpts.length-1], /* 本次操作源 */
            choice_bot = bout.replyOpts[bout.replyOpts.length-1], /* 对应操作 */
            last_choice = bout.replyOpts.length <= 1;
        
		if (card instanceof Array) {
			card = card[0];
		}
        if(opt.id == "技能") {
			switch(choice_bot.data) {
				case "洛神":
					if (card) { 
						bout.last_judge_card = null;
						action_execute(bout, opt);
					} else { /* 不发动洛神 */
						pltar.status["zhenji.luoshen"] = -1;
					}
					break;
				case "鬼才":
					if (card) { /* 发动鬼才,替换之前的判定牌 */
					    bout.last_judge_card = card;
					}
					action_execute(bout, opt);
					break;
			}
			bout.replyOpts.pop();
        } else if (card) { /* 有卡应对 */
            sgs.interface.focusPlayer(plsrc.dom, false);
            bout.notify("response_card", plsrc, pltar, card);
            switch(card.name) {
                case "桃":
                    pltar.blood++;
                    bout.notify("get_cure", pltar);
                    if(pltar.blood > 0) { /* 健康了 */
                        bout.replyOpts = exclude(bout.replyOpts, 
                                              function(i) { return i.id == "桃" && i.target == pltar; });
                    }
                    //可能还需要桃
                    //bout.replyOpts.pop();
                    break;
				case "杀":
                case "闪":
					if (opt_top.id == "决斗") {
					    var tmp_plsrc = choice_bot.source;
						choice_bot.source = choice_bot.target;
						choice_bot.target = tmp_plsrc;
					} else {
                        bout.playOpts.pop();
                        bout.replyOpts.pop();
					}
                    console.log(_("{0} 打出了{1}", plsrc.nickname, card.name)); 
                    break;
                case "无懈可击":
                    console.log(_("{0} 使用了无懈可击!", plsrc.nickname));
                    bout.replyOpts.pop();
					bout.wuxie_count++;
					/* FIXME:每次进行无懈可击后,需要再次询问所有人 */
                    if (last_choice) { /* 如果是最后一次请求无懈可击. */
					    if (0 == (bout.wuxie_count & 1)) { /* 如果被无懈可击则不用进行原来卡牌的判定,否则进行原来卡牌的判定 */
                            bout.last_judge_card = null;
							if (!action_execute(bout, opt_top)) {
							    /* 五谷丰登等是异步动作,会自己continue */
							    return;
							}
						} else {
					        bout.playOpts.pop();
						}
					}
                    break;
            }
        } else if(choice_bot) { /* 无所作为 */
			switch(choice_bot.id) {
				case "桃":
			        bout.replyOpts.pop();
					console.log(choice_bot.target.nickname, "表示无桃");
					if (last_choice) { /* 如果是最后一次请求无懈可击. */
						console.log("TODO: nobody can help, dead...");
						bout.judge();
					}
					break;
				case "无懈可击":
			        bout.replyOpts.pop();
					console.log(choice_bot.target.nickname, "表示没有无懈");
					if (last_choice) { /* 如果是最后一次请求无懈可击. */
					    if (0 == (bout.wuxie_count & 1)) { /* 如果被无懈可击则不用进行原来卡牌的判定,否则进行原来卡牌的判定 */
				    		bout.last_judge_card = null;
							if (!action_execute(bout, opt_top)) {
							    /* 五谷丰登等是异步动作,会自己continue */
							    return;
							}
						} else {
						    bout.playOpts.pop();
						}
					}
					break;
				case "杀":
				case "闪":
			        bout.replyOpts.pop();
					pltar = opt_top.target;
					plsrc = opt_top.source;
					bout.playOpts.pop();

					pltar.blood--;
					console.log(_("{0} 扣一滴血,还剩下{1}滴血", pltar.nickname, pltar.blood));
					bout.notify("get_damage", pltar);
					if(pltar.blood < 1) {
						ask_peach(bout, pltar, plsrc);
					};
					break;
			}
        }
        
        bout.continue();
    } })(sgs.interpreter.action_execute,
         sgs.interpreter.ask_peach);

    sgs.interpreter.play_card = (function(action_execute, ask_wuxie){ return function(bout, opt) {
        var plsrc = opt.source,
            pltar = opt.target,
            card = opt.data;
        
		if (card instanceof Array) {
			card = card[0];
		}
		
        var equip_pos = sgs.EQUIP_TYPE_MAPPING[card.name];
        if(equip_pos != undefined) {
            console.log(_("{0} 装备了 {1}", pltar.nickname, card.name));
            pltar.equip[equip_pos] = card;
            bout.notify("equip_on", pltar, card, equip_pos); 
        } else {
            console.log(_("play {0} 对 {1} 使用 {2}", plsrc.nickname, pltar.nickname, card.name));
            bout.notify("play_card", plsrc, pltar, card);
            var has_wuxie,
                may_wuxie = false;
            switch(card.name) {
                case "杀":
                    bout.playOpts.push(opt);
                    bout.replyOpts.push(new sgs.Operate("闪", plsrc, pltar, "闪"));
                    break;
                case "桃":
                    if (pltar.blood < pltar.maxblood) {
                        pltar.blood++;
						bout.notify("get_cure", pltar);
                        console.log(_("{0} 恢复一滴血,还剩下{1}滴血", pltar.nickname, pltar.blood));
                    }
                    break;
                case "乐不思蜀":
                    pltar.be_decision.push(opt);
                    break;
                case "闪电":
                    opt.has_init = false;
                    pltar.be_decision.push(opt);
                    break;
				case "五谷丰登":
				case "桃园结义":
					/* 从当前玩家开始,依次(后面的玩家先选牌)将玩家放入playOpts堆栈,从自己开始依次接受操作 */
					for (var i = plsrc.position + bout.playerlen - 1; i >= plsrc.position; i--) {
					    var pl = bout.player[i%bout.playerlen];
					    if (pl.blood > 0) {
					        bout.playOpts.push(new sgs.Operate(card.name, plsrc, pl, card));
						}
					}
					if ("五谷丰登" == card.name) {
		    		    bout.choiceList = bout.card.splice(0, bout.player.length);
					}
                    may_wuxie = ask_wuxie(bout, pltar);
					/* 因为下面有continue,而action_execute(card.name)也有continue,所以这里不要直接调用action_execute */
	                break;
				case "南蛮入侵":
				case "万箭齐发":
					/* 从当前玩家开始,依次(后面的玩家先选牌)将玩家放入playOpts堆栈,从自己下一玩家开始依次接受操作 */
					for (var i = plsrc.position + bout.playerlen - 1; i > plsrc.position; i--) {
					    var pl = bout.player[i%bout.playerlen];
					    if (pl.blood > 0) {
					        bout.playOpts.push(new sgs.Operate(card.name, plsrc, pl, card));
						}
					}
                    may_wuxie = ask_wuxie(bout, pltar);
					/* 因为下面有continue,而action_execute(card.name)也有continue,所以这里不要直接调用action_execute */
	                break;
                case "无中生有":
				case "借刀杀人":
				case "顺手牵羊":
				case "过河拆桥":
				case "决斗":
					bout.playOpts.push(opt);   
                    may_wuxie = ask_wuxie(bout, pltar);
                    if (!may_wuxie) {
                        action_execute(bout, opt);
                    }
                    break;
                default:
                    sgs.interpreter.response_card(bout, opt);
                    return;
            }
        }
        bout.continue();
    } })(sgs.interpreter.action_execute,
         sgs.interpreter.ask_wuxie);

    sgs.interpreter.decision = (function(action_execute, ask_wuxie){ return function(bout, pltar, opt) {
        var plsrc = opt.source,
            card = opt.data,
            may_wuxie = false;
        
		if (card instanceof Array) {
			card = card[0];
		}
        switch(card.name) {
            case "乐不思蜀":
                may_wuxie = ask_wuxie(bout, pltar); 
                if (!may_wuxie) {
                    bout.last_judge_card = null;
                    action_execute(bout, opt);
                } else {
                    bout.playOpts.push(new sgs.Operate("乐不思蜀", plsrc, pltar, card));
				}
                break;
            case "闪电":
                if (!opt.has_init) { /* 闪电尚未初始化 */
                    opt.has_init = true;
                    pltar.be_decision.push(opt);
                } else { /* 闪电已经初始化 */
                    may_wuxie = ask_wuxie(bout, pltar);
                    if (!may_wuxie) {
                        bout.last_judge_card = null;
                        action_execute(bout, opt);
                    } else {
                        bout.playOpts.push(new sgs.Operate("闪电", plsrc, pltar, card));
					}
                }
                break;
        }
        return bout.continue();
    } })(sgs.interpreter.action_execute,
         sgs.interpreter.ask_wuxie);

    sgs.interpreter.judge = function(bout) {
        var idens = bout.live_body_identity(),
            live_idens = filter(idens, function(i) { return i != -1; }),
            tmp;

        tmp = filter(live_idens, function(i) { return i == sgs.IDENTITY_TRAITOR || i == sgs.IDENTITY_REBEL; });
        if(tmp.length == 0 && live_idens.indexOf(sgs.IDENTITY_LORD) != -1) { /* 主公忠臣判定 */ 
            tmp = {"winner": filter(bout.player, function(i){ return i.identity == sgs.IDENTITY_LORD || i.identity == sgs.IDENTITY_LOYALIST; }),
                   "msg": "主公胜利" };
            return tmp;
        } 
        if(live_idens.length == 1 && live_idens[0] == sgs.IDENTITY_TRAITOR) { /* 内奸判定 */
            tmp = {"winner": filter(bout.player, function(i){ return i.identity == sgs.IDENTITY_TRAITOR && i.blood > 0; }),
                   "msg": "内奸胜利" };
            return tmp; 
        }
        
        if(live_idens.indexOf(sgs.IDENTITY_LORD) == -1) { /* 反贼胜利 */
            tmp = {"winner": filter(bout.player, function(i){ return i.identity == sgs.IDENTITY_REBEL; }),
                   "msg": "反贼胜利" };
            return tmp;
        }
        return;
    };

         
})(window.sgs);
