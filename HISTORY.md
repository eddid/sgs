2015-08-11
============
add logic_ai_clips.js, do AI base on sgs_clips
add Player.prototype.addcard, notify add card at a uniform place
add debug mode for debuging, replace timer to click step by step


2015-07-31
============
implement features:
wuguofengdeng(add choiceList in Bout, update continue for get card one by one)
wanjianqifa
nanmanruqin
juedou
luoshen
wuxiekeji(add wuxie_count in Bout. partly, need ask wuxie with all other players again if someone reply wuxie)
update blood for all players
add animation for Judge_Card/Drop_Card/Get_Cure(partly)
implement choose_card function for AI and human players
add code for dead player

fix issues:
active usable cards in ask_card
fixed choose roles conflict issue(two players choose the same role)
ok/cancel/abandon buttons active/deactive issue

optimize codes:
rename Bout.opt to Bout.playOpts
rename Bout.choice to Bout.replyOpts
replace Bout.playernum with Player.position
unite Bout.step and Player.stage to Bout.stage
add enumeration for stage/identity
remove choice_card, invoke play_card/respond_card directly

2015-07-26
============

fixed bugs:
ok/cancel button status issue,
wuzhongshengyou bad bout.opt issue,
calculate distance issue,
step status issue,
focusPlayer on player issue(not fixed completly)
changed name of functions:
discard -> drop_card
usecard -> play_card
getcard -> get_card
add resource for renwang_shield

2011-05-28
============

逻辑:

  增加AI自动装备装备逻辑.  
  添加安装装备事件,摸牌事件,主动出牌事件.  
  增加操作延迟.

2011-05-23
============

界面:

  实现英雄技能解释的显示
  实现时间减少动画
  修改初始化界面显�?


2011-05-22
============

界面:

  重构代码
  完善界面数据显示


2011-05-20
============

界面:

  添加装备装备、选牌动画
  添加数据和图�?
  完成英雄选择等初始化

2011-05-19
============

逻辑实现:

  实现四个流程.
  实现选牌后的攻击范围计算.
  抽离基础函数以及解析脚本.

2011-05-18
============

逻辑实现:

  实现了开局.初始�?
  摸牌.洗牌.
  日志记录.
  接下来打算更改游戏流�?加上`判定`前后,`摸牌`前后,`出牌`前后,`弃牌`前后 事件.使流程更丰满.

2011-05-18
============

界面:

  修改页面，下载图片素�?

2011-5-17
============

界面:

  完成发牌动画，解决与其他动画冲突

逻辑实现:

  完成数据对象建立.创建部分数据.
  导入测试框架Qunit;

2011-05-14
============

建项.
