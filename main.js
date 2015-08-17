$(document).ready(function () {
    
    sgs.interface.Load_Data();
    
    var identity, /* 身份列表 */
        player_count, /* 玩家数量 */
        players = [], /* 玩家列表(临时变量) */
        player_heros, /* 玩家可选英雄 */
        choose_heros; /* 所有可选英雄 */
	var playerDom = $('#player')[0];
    
    var overwrite = function(player) { /* 重写玩家方法 */
        player.play_card = function() {
            if (sgs.interface.bout.stage == sgs.STAGE_PLAY_CARD) {
                $('#player_cover').css('display', 'none');
                $('#abandon').css('display', 'block');
				sgs.interface.playSound('sound/system/your-turn.ogg');
                $('.player_card .select_unable').each(function(i, d) {
                    $(d).css('display', 'none');
                });
            }
            this.selected_targets = [];
        };
        player.drop_card = function() {
            this.selected_targets = [];
            this.card_selectable_count = this.card.length - this.blood;
            $('#abandon').css('display', 'none');
			$('.player_card').each(function(i, d) {
				$(d).css('top', 0);
				$(d).find('.select_unable').css('display', 'none');
			});
			if (this.card_selectable_count < 1) {
			    sgs.interface.bout.drop_card(null);
			}
        };
        player.ask_card = function(opt) {
            $('#player_cover').css('display', 'none');
            $('#cancel').css('display', 'block');
            $('.player_card').each(function(i, d) {
                if (d.card.name != opt.id) {
                    $(d).find('.select_unable').css('display', 'block');
				} else {
                    $(d).find('.select_unable').css('display', 'none');
				}
            });
			this.targets = [];
            this.targets.push(opt.target);
            this.source_card = opt.data;
			if(opt.id == "技能") {
				switch (opt.data) {
					case "洛神":
						$('#ok').css('display', 'block');
						break;
					case "鬼才":
						if (this.card.length > 0) {
							$('#ok').css('display', 'block');
						}
						break;
				}
			}
        };
    };
    
    var bin_event = function() { /* 绑定事件 */
        sgs.interface.bout.attach("get_card", function(player, cards) {
            if (player.dom == playerDom) {
                sgs.animation.Deal_Player(cards);
            } else {
                sgs.animation.Deal_Comp(cards.length, player);
            }
        });
        sgs.interface.bout.attach("get_damage", function(plsrc, pltar) {
            sgs.animation.Get_Damage(pltar);
			sgs.eventNotify("attack " + plsrc.position + " " + pltar.position + " " + pltar.blood);
        });
        sgs.interface.bout.attach("get_cure", function(plsrc, pltar) {
            sgs.animation.Get_Cure(pltar);
			sgs.eventNotify("save " + plsrc.position + " " + pltar.position + " " + pltar.blood);
        });
        sgs.interface.bout.attach("refuse_damage", function(plsrc, pltar, cardName) {
			sgs.eventNotify("refuseattack " + plsrc.position + " " + pltar.position + " " + cardName);
        });
        sgs.interface.bout.attach("refuse_cure", function(plsrc, pltar, cardName) {
			sgs.eventNotify("refusesave " + plsrc.position + " " + pltar.position + " " + cardName);
        });
        sgs.interface.bout.attach("tryto_damage", function(plsrc, pltar, cardName) {
			sgs.eventNotify("refusesave " + plsrc.position + " " + pltar.position + " " + cardName);
        });
        sgs.interface.bout.attach("tryto_cure", function(plsrc, pltar, cardName) {
			sgs.eventNotify("refuseattack " + plsrc.position + " " + pltar.position + " " + cardName);
        });
        sgs.interface.bout.attach("equip_on", function(player, card, equip_pos) {
            sgs.animation.Equip_Equipment(player, card, equip_pos);
			sgs.eventNotifyEquip(player.position, card, equip_pos, true);
        });
        sgs.interface.bout.attach("equip_off", function(player, card, equip_pos) {
            //sgs.animation.Unarm_Equipment(player, card, equip_pos);
			sgs.eventNotifyEquip(player.position, card, equip_pos, false);
        });
        sgs.interface.bout.attach("play_card", sgs.animation.Play_Card);
        sgs.interface.bout.attach("judge_card", sgs.animation.Judge_Card);
        sgs.interface.bout.attach("drop_card", sgs.animation.Drop_Card);
        sgs.interface.bout.attach("response_card", sgs.animation.Play_Card);
		
		if ($('#game_debug')[0].value == "on") {
			sgs.interface.bout.continue = function(){};
			//$('#game_start').bind('click', function(){sgs.interface.bout.realcontinue()});
		}
    };

    /* 游戏开始 */
    $('#game_start').click(function (e) {
		var game_debug = $('#game_debug');
		var game_start = $('#game_start');
        game_start.unbind('click', arguments.callee);
		if (game_debug[0].value == "on") {
			game_start.html("下一步");
			game_debug[0].disabled = true;
			game_start.bind('click', function(){sgs.interface.bout.realcontinue()});
			//sgs.interface.bout.continue = function(){};
		}
        $('#choose_back').css('display', 'block');
        $('#choose_box').css('display', 'table');
        
		/* 通知sgs_clips服务器 */
		sgs.eventNotify("setmode 1 1 1 1", function(data) {
		    console.log(data);
			sgs.uuid = data;
		});

        player_count = 4;
        choose_heros = sgs.Bout.get_hero((player_count - 1) * 3 + 1);
        
        identity = sgs.Bout.get_identity(player_count); /* 第0个表示玩家身份 */
        
        identity[0] = sgs.IDENTITY_REBEL;
        identity[1] = sgs.IDENTITY_TRAITOR;
        identity[2] = sgs.IDENTITY_LOYALIST;
        identity[3] = sgs.IDENTITY_LORD;
        
        for(var i = 0; i < player_count; i++) {
            players.push({
                "identity": identity[i],
				"position": i,
                "dom": (i == 0 ? $('#player') : $('#role' + i))[0],
                "isAI": i == 0 ? false : true
            });
        }
        
        if(identity[0] == sgs.IDENTITY_LORD) { /* 玩家是主公时 */
            $('#choose_role_bg, #choose_role').css('width', '550px');
            $('#choose_role_content').css('width', '520px');
            $('#choose_role_title').css('left', '195px');
            $('.player_progress_bar').css('left', '125px');
            
            player_heros = sgs.Bout.get_king_hero();
        } else { /* 玩家不是主公时 */
            $('#choose_role_bg, #choose_role').css('width', '340px');
            $('#choose_role_content').css('width', '310px');
            $('#choose_role_title').css('left', '90px');
            $('.player_progress_bar').css('left', '20px');
            
            /* 主公随机选英雄 */
            king_hero = sgs.func.choice(sgs.Bout.get_king_hero())[0];
			//king_hero = sgs.HERO[6];//["甄姬"];
            
            $.each(identity, function(i, d) {
                if(d == 0) {
                    players[i].hero = king_hero;
                    return false;
                }
            });
            choose_heros = sgs.func.sub(choose_heros, [king_hero]);
            player_heros = choose_heros.splice(0, 3);
        }
        
        sgs.interface.Show_CardChooseBox(
            '选择您的武将',
            player_heros,
            '你的身份是 - ' + sgs.IDENTITY_INDEX_MAPPING.name[identity[0]]);
    });

    /* 选择英雄 */
    $('.choose_role_card').live('click', function (e) {
        $('#choose_box_bgcover').remove();
        $('#choose_box').remove();
    
        var pls = [];
        
        /* 玩家选择英雄 */
        players[0].hero = this.objRef;
        
        if(players[0].identity == sgs.IDENTITY_LORD)
            choose_heros = sgs.func.sub(choose_heros, [players[0].hero]);
        
        for (var i = 1; i < player_count; i++) { /* 电脑选择英雄 */
            if (players[i].hero != undefined)
                continue;
            players[i].hero = choose_heros.splice(0, 3)[0];
        }
        
        for (var i = 0; i < player_count; i++) {
            var tempPlayer = new sgs.Player('_' + players[i].hero.name + '_', players[i].identity, players[i].hero, players[i].isAI, players[i].position),
                tempDom = (i == 0 ? $('#player') : $('#role' + i))[0];
            
            tempPlayer.dom = tempDom;
            tempPlayer.selected = false;
            tempDom.player = tempPlayer;
            if (i == 0)
                overwrite(tempPlayer);
            pls.push(tempPlayer);
        }
        /**************************************/
        /*********** 游戏正式开始 *************/
        /**************************************/
        sgs.interface.bout = new sgs.Bout(pls);
        bin_event();
        
        /*** 测试用 ***/
        /*$.each(sgs.interface.bout.player, function(i, d) {
            if (d.identity == 0) {
                d.card[0].name = '决斗';
                d.card[1].name = '过河拆桥';
                d.card[2].name = '闪';
                d.card[3].name = '闪';
            } else {
                d.card[0].name = '杀';
                d.card[1].name = '闪';
                d.card[2].name = '桃';
                d.card[3].name = '万箭齐发';
            }
        });*/
        
        var player_self = playerDom.player;
        player_self.card_selectable_count = -1;
        player_self.selected_cards = [];
        player_self.targets = [];
        player_self.selected_targets = [];
        player_self.target_selectable_count = -1;
        player_self.source_card = '';
        
        /* 设置信息并发牌 */
        $(sgs.interface.bout.player).each(function (i, d) {
            if (d.dom == playerDom) {
                sgs.interface.Set_RoleInfo(d);
                setTimeout(sgs.animation.Deal_Player, 200, d.card); /* 发牌 */
            } else {
                sgs.interface.Set_RoleInfo(d);
                setTimeout(sgs.animation.Deal_Comp, 200, d.card.length, d); /* 发牌 */
            }
        });
    });
    
    /* 选牌 */
    $('.player_card').live('click', function (e) {
        if(this.onDrag)
            return;
        var cardDom = this,
            cardOut = sgs.interface.cardInfo.out,
            player = playerDom.player;

		if ((player.position != sgs.interface.bout.curplayer)
		  || (sgs.interface.bout.playOpts.length > 0)) {
			$('.player_card').each(function(i, d) {
				if(d == cardDom) {
					$(d).animate({ 'top': (d.card.selected ? 0 : -cardOut) }, 100);
					$('#ok').css('display', d.card.selected ? 'none' : 'block');
					d.card.selected = !d.card.selected;
					console.log('选牌:', d.card);
				} else {
					$(d).animate({ 'top': 0 }, 100);
					d.card.selected = false;
				}
			});
		    return;
		}
        switch (sgs.interface.bout.stage) {
            case sgs.STAGE_PLAY_CARD:/* 出牌阶段 */
                $('.player_card').each(function(i, d) {/* 设置卡牌选中状态与玩家选中状态 */
                    if(d == cardDom) {
                        if(cardDom.card.selected) { /* 卡牌已被选中时则取消选中 */
                            console.log('取消选牌:', d.card);
                            $(cardDom).animate({ 'top': '0px' }, 100);
                            cardDom.card.selected = false;
                            player.targets = [];
                            $('.role').each(function(i, d) {/* 设置玩家为可选状态 */
                                $(d).find('.role_cover').css('display', 'none');
                                if (d.player.selected) {
                                    sgs.interface.focusPlayer(d, false);
                                }
                            });
                            $('#ok').css('display', 'none');/* 隐藏确定按钮 */
                        } else { /* 卡牌没有被选中时 */
                            cardDom.card.selected = true;
                            $(cardDom).animate({ 'top': -cardOut + 'px' }, 100);

                            var targets_info = sgs.interface.bout.select_card(new sgs.Operate(cardDom.card.name, player, undefined, cardDom.card));
                            console.log('选牌', d.card, '可选目标:', targets_info[0], '可选目标数:', targets_info[1])
                            player.targets = targets_info[0];
                            player.target_selectable_count = targets_info[1];
                            $('.role .role_cover').each(function(i, d) {/* 设置玩家可选状态 */
                                $(d).css('display', 'block');
                            });
                            $.each(player.targets, function(i, d) {
                                $('.role').each(function(ii, dd) {
                                    if(d.nickname == dd.player.nickname) {
                                        $(dd).find('.role_cover').css('display', 'none');
                                    }
                                });
                            });
							if (0 == player.target_selectable_count)/* 如果不需要选择目标则激活“确定”按 */
                                $('#ok').css('display', 'block');
                            else
                                $('#ok').css('display', 'none');
                        }
                    } else {
                        d.card.selected = false;
                        $(d).animate({ 'top': 0 }, 100);
                    }
                });
                break;
            case sgs.STAGE_DROP_CARD:/* 弃牌阶段 */
                if (cardDom.card.selected) {
                    $(cardDom).animate({ 'top': 0 }, 100);
                    cardDom.card.selected = false;
                    player.card_selectable_count++;
                } else {
                    if(player.card_selectable_count == 0)
                        return;
                    $(cardDom).animate({ 'top': -cardOut + 'px' }, 100);
                    cardDom.card.selected = true;
                    player.card_selectable_count--;
                }
                if (player.card_selectable_count == 0) {
                    $('#ok').css('display', 'block');
				} else {
                    $('#ok').css('display', 'none');
				}
                break;
        }

    });

    /* 选择装备(技能) */
    $('.equip_box').live('click', function(e) {
        //$(this).animation({ left: });
    });
    
    /* 拖动 */
    $('.player_card').live('dragstart', function() { return false; });
    $('.player_card').live('mousedown', sgs.animation.Mouse_Down);
    $(document.body).bind('mousemove', sgs.animation.Mouse_Move);
    $('.player_card').live('mouseup', sgs.animation.Mouse_Up);/* mouseout 防止拖动过快 */
    
    /* 选择目标 */
    $('.role').click(function(e) {
        if($(this).find('.role_cover').css('display') == 'block')
            return false;
        
        var player = playerDom.player;
        
        if(player.targets.length == 0)
            return false;
        
        if (!this.player.selected) {
			sgs.interface.focusPlayer(this, true);
            player.selected_targets.push(this.player);
            player.target_selectable_count--;
            console.log('选择目标:', this.player, this.player.nickname);
            if(player.target_selectable_count == 0) {/* 选择目标达到【目标数量】时，将其他可选目标设为不可选状态 */
                $.each(sgs.func.sub(player.targets[0], player.selected_targets), function(i, d) {
                    $(d.dom).find('.role_cover').css('display', 'block');
                });
                $('#ok').css('display', 'block');
                console.log('可以出牌, 目标:', player.selected_targets);
            }
        } else {
            sgs.interface.focusPlayer(this, false);
            player.selected_targets = sgs.func.sub(player.selected_targets, [this.player]);
            player.target_selectable_count++;
            console.log('取消选择目标:', this.player);
            if(player.target_selectable_count == 1) {/* 【已选目标数量】比【可选目标数量】刚好小【1】时将其他可选目标设为可选状态 */
                $.each(sgs.func.sub(player.targets[0], player.selected_targets), function(i, d) {
                    $(d.dom).find('.role_cover').css('display', 'none');
                });
                $('#ok').css('display', 'none');
            }
        }
    });

    /* 确定按钮 */
    $('#ok').mouseup(function(e) {
        $(this).find('.hover').css('display', 'block');
        var player = playerDom.player;
        $(this).css('display', 'none');
        $('#cancel').css('display', 'none');
        
        player.selected_cards = [];
        $.each(player.card, function(i, d) {
            if(d.selected)
                player.selected_cards.push(d);
        });
		var opt = new sgs.Operate(
                player.selected_cards[0].name,
                player,
                player.selected_targets.length == 0 ? player : player.selected_targets[0],
                player.selected_cards
            );
		/* 如果是非当前玩家,则应牌 */
		if ((player.position != sgs.interface.bout.curplayer)
		  || (sgs.interface.bout.playOpts.length > 0)) {
			console.log('应牌:', player, '目标:', opt.target);
            sgs.interface.bout.response_card(opt);
			return;
		}
		/* 无论是出牌还是弃牌,将所选用户取消 */
		$('.role').each(function(i, d) {/* 设置玩家为可选状态 */
			$(d).find('.role_cover').css('display', 'none');
			if (d.player.selected) {
				sgs.interface.focusPlayer(d, false);
			}
		});
		switch (sgs.interface.bout.stage) {
            case sgs.STAGE_PLAY_CARD:/* 出牌阶段 */
				console.log('出牌:', player, '目标:', opt.target);
                sgs.interface.bout.play_card(opt);
				break;
            case sgs.STAGE_DROP_CARD:/* 弃牌阶段 */
				console.log('弃牌:', player, '目标:', opt.target);
                sgs.interface.bout.drop_card(opt);
			    break;
		}
    });
    
    /* 取消按钮 */
    $('#cancel').mouseup(function(e) {
        if (e.button != 0)
            return;
        $(this).css('display', 'none');
        $('#ok').css('display', 'none');
        var player = playerDom.player;
        /*if (player.position != sgs.interface.bout.curplayer)*/ {
			$('.player_card').each(function(i, d) {
				d.card.selected = false;
				$(d).find('.select_unable').css('display', 'none');
				$(d).animate({ top: 0 }, 100);
			});
			$('#player_cover').css('display', '');
			sgs.interface.bout.response_card(new sgs.Operate(player.source_card, player, player.targets[0], undefined));
        }
    });
    
    /* 弃牌按钮 */
    $('#abandon').mouseup(function(e) {
        $('.player_card').each(function(i, d) {
            $(d).css('top', 0);
            $(d).find('.select_unable').css('display', 'none');
        });
        
        var player = playerDom.player;
		sgs.interface.bout.stage = sgs.STAGE_DROP_CARD;
        player.drop_card();
    });

    /* 五谷丰登等选牌 */
    $('.choose_card').live('click', function(e) {
        $('#choose_box_bgcover').remove();
        $('#choose_box').remove();

        var player = playerDom.player;
		var bout = sgs.interface.bout;
        var card_pos = bout.choiceList.indexOf(this.objRef);
        if (card_pos != -1) {
            bout.choiceList.splice(card_pos, 1);
        }
        player.card.push(this.objRef);
		bout.notify("get_card", player, [this.objRef]);

		/* 为下一玩家选牌作准备 */
		if (bout.playOpts.length > 0) {
			var next_opt = bout.playOpts[bout.playOpts.length - 1];
			sgs.interpreter.ask_wuxie(bout, next_opt.target);
		}
		bout.continue();
	});
    
    /* 显示技能解释 */
    $('.choose_role_card, .head_img, #player_head').live('mousemove', function(e) {
        var vthis = this,
            expDom = $('#explanation')[0];

        $('#explanation').css({
            display: 'none',
            'z-index': '0',
        });
        if(expDom.explanation_id != undefined)
            clearTimeout(expDom.explanation_id);
        expDom.explanation_id = setTimeout(function() {
            sgs.animation.Skill_Explanation(
                vthis.objRef.name,
                true,
                e.clientX,
                e.clientY
            );
            $('#explanation').css({
                display: 'block',
                'z-index': '999',
            });
        }, 1000);
    }).live('mouseout mouseup', function(e) {
        var expDom = $('#explanation')[0];
        if(expDom.explanation_id != undefined)
            clearTimeout(expDom.explanation_id);
        $('#explanation').css({
            display: 'none',
            'z-index': '0',
        });
    })
    $('#explanation').hover(function(e) {
        this.hover = true;
        clearTimeout(this.explanation_id);
    }, function(e) {
        this.hover = false;
        $('#explanation').css({
            display: 'none',
            'z-index': '0',
        });
    });
    
    /* 身份按钮 */
    $('#player_identity').click(function(e) {
        var target = $(this).find('img');
        target.css('display', target.css('display') == 'none' ? 'block' : 'none');
    });
    $('.role_identity').click(function(e) {
        var imgSrcPart = $(this).find('img').attr('src').split('/');
        if(imgSrcPart[imgSrcPart.length - 1] == 'king.png') {
            if($(this).find('span').length == 0)
                $(this).append($('<span style="display:none;"></span>'));
            $(this).find('img').attr('src', 'img/none.png');
        } else if($(this).find('span').length != 0) {
            $(this).find('img').attr('src', sgs.IDENTITY_IMG_MAPPING[0]);
        } else {
            $(this).find('img').attr('src', 'img/system/none.png');
            var target = $(this).next('.role_identity_select');
            target.css('display', target.css('display') == 'none' ? 'block' : 'none');
        }
        return false;
    });
    $('.role_identity_select img').click(function(e) {
        $(this).parent().prev().find('img').attr('src', $(this).attr('src'));
        $(this).parent().css('display', 'none');
        return false;
    });

    /* 按钮样式变化 */
    $('#ok, #cancel, #abandon').hover(function (e) {
        $(this).find('.normal').css('display', 'none');
        $(this).find('.hover').css('display', 'block');
    }, function (e) {
        $(this).find('.normal').css('display', 'block');
        $(this).find('.hover').css('display', 'none');
    }).mousedown(function (e) {
        if(e.button != 0)
            return false;
        $(this).find('.hover').css('display', 'none');
    });

    $('#main').mousedown(function(e) { return false; });
    
    /* 取消浏览器默认拖动 */
    $('img').live('dragstart', function() { return false; });

    /* 浏览器改变大小 */
    $(window).resize(function (e) {
        return false;
        var des = $(window).height() - $('#main').height(),
            val;
        if(des < 0)
            val = 0;
        else if(des < 80)
            val = des / 2;
        else
            val = 80;
        $('#main').css('margin-top', val);
    });

    /* 页面刷新或关闭 */
	$(window).unload(function(){
		/* 通知sgs_clips服务器 */
		sgs.eventNotify("exit", undefined, undefined, false);
	});
});