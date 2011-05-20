var sgs = sgs || {};
sgs.PLAYER_NUM = 4;
sgs.DEFAULT_AI_LV = 0;

/*
 * 卡牌数据
 * 'color' : 方块: 0, 红桃: 1, 梅花: 2, 黑桃: 3;
 */

sgs.CARDIMAG_MAPING = {
    "万箭齐发": "archery_attack.png",
    "丈八蛇矛": "spear.png",
    "乐不思蜀": "indulgence.png",
    "五谷丰登": "amazing_grace.png",
    "仁王盾": "renwang_shield.png",
    "借刀杀人": "collateral.png",
    "八卦阵": "eight_diagram.png",
    "决斗": "duel.png",
    "南蛮入侵": "savage_assault.png",
    "大宛": "dayuan.png",
    "寒冰剑": "ice_sword.png",
    "方天画戟": "halberd.png",
    "无中生有": "ex_nihilo.png",
    "无懈可击": "nullification.png",
    "杀": "slash.png",
    "桃": "peach.png",
    "桃园结义": "god_salvation.png",
    "爪黄飞电": "zhuahuangfeidian.png",
    "的卢": "dilu.png",
    "紫骍": "zixing.png",
    "绝影": "jueying.png",
    "诸葛连弩": "crossbow.png",
    "贯石斧": "axe.png",
    "赤兔": "chitu.png",
    "过河拆桥": "dismantlement.png",
    "闪": "jink.png",
    "闪电": "lightning.png",
    "雌雄双股剑": "double_sword.png",
    "青釭剑": "qinggang_sword.png",
    "青龙偃月刀": "blade.png",
    "顺手牵羊": "snatch.png",
    "麒麟弓": "kylin_bow.png",
};

sgs.HEROIMAG_MAPPING = {
	"曹操": "caocao.png",
	"张辽": "zhangliao.png",
    "郭嘉": "guojia.png",
	"夏侯淳": "xiahoudun.png",
	"司马懿": "simayi.png",
	"许褚": "xuchu.png",
	"甄姬": "zhenji.png",
	"刘备": "liubei.png",
	"关羽": "guanyu.png",
	"张飞": "zhangfei.png",
    "赵云": "zhaoyun.png",
	"马超": "machao.png",
	"诸葛亮": "zhugeliang.png",
	"黄月英": "huangyueying.png",
    "孙权": "sunquan.png",
	"周瑜": "zhouyu.png",
	"吕蒙": "lvmeng.png",
	"陆逊": "luxun.png",
	"甘宁": "ganning.png",
    "黄盖": "huanggai.png",
	"大乔": "daqiao.png",
	"孙尚香": "sunshangxiang.png",
	"吕布": "lvbu.png",
	"华佗": "huatuo.png",
	"貂蝉": "diaochan.png"
};

sgs.CARD = [
    { 'name': '杀', 'color': 3, 'digit': '7', },
    { 'name': '杀', 'color': 3, 'digit': '8', },
    { 'name': '杀', 'color': 3, 'digit': '8', },
    { 'name': '杀', 'color': 3, 'digit': '9', },
    { 'name': '杀', 'color': 3, 'digit': '9', },
    { 'name': '杀', 'color': 3, 'digit': '10', },
    { 'name': '杀', 'color': 3, 'digit': '10', },
    { 'name': '杀', 'color': 2, 'digit': '2', },
    { 'name': '杀', 'color': 2, 'digit': '3', },
    { 'name': '杀', 'color': 2, 'digit': '4', },
    { 'name': '杀', 'color': 2, 'digit': '5', },
    { 'name': '杀', 'color': 2, 'digit': '6', },
    { 'name': '杀', 'color': 2, 'digit': '7', },
    { 'name': '杀', 'color': 2, 'digit': '8', },
    { 'name': '杀', 'color': 2, 'digit': '8', },
    { 'name': '杀', 'color': 2, 'digit': '9', },
    { 'name': '杀', 'color': 2, 'digit': '9', },
    { 'name': '杀', 'color': 2, 'digit': '10', },
    { 'name': '杀', 'color': 2, 'digit': '10', },
    { 'name': '杀', 'color': 2, 'digit': '11', },
    { 'name': '杀', 'color': 2, 'digit': '11', },
    { 'name': '杀', 'color': 1, 'digit': '2', },
    { 'name': '杀', 'color': 1, 'digit': '2', },
    { 'name': '杀', 'color': 1, 'digit': '13', },
    { 'name': '杀', 'color': 0, 'digit': '6', },
    { 'name': '杀', 'color': 0, 'digit': '7', },
    { 'name': '杀', 'color': 0, 'digit': '8', },
    { 'name': '杀', 'color': 0, 'digit': '9', },
    { 'name': '杀', 'color': 0, 'digit': '10', },
    { 'name': '杀', 'color': 0, 'digit': '13', },
    { 'name': '闪', 'color': 1, 'digit': '2', },
    { 'name': '闪', 'color': 1, 'digit': '2', },
    { 'name': '闪', 'color': 1, 'digit': '13', },
    { 'name': '闪', 'color': 0, 'digit': '2', },
    { 'name': '闪', 'color': 0, 'digit': '2', },
    { 'name': '闪', 'color': 0, 'digit': '3', },
    { 'name': '闪', 'color': 0, 'digit': '4', },
    { 'name': '闪', 'color': 0, 'digit': '5', },
    { 'name': '闪', 'color': 0, 'digit': '6', },
    { 'name': '闪', 'color': 0, 'digit': '7', },
    { 'name': '闪', 'color': 0, 'digit': '8', },
    { 'name': '闪', 'color': 0, 'digit': '9', },
    { 'name': '闪', 'color': 0, 'digit': '10', },
    { 'name': '闪', 'color': 0, 'digit': '11', },
    { 'name': '闪', 'color': 0, 'digit': '11', },
    { 'name': '桃', 'color': 1, 'digit': '3', },
    { 'name': '桃', 'color': 1, 'digit': '4', },
    { 'name': '桃', 'color': 1, 'digit': '6', },
    { 'name': '桃', 'color': 1, 'digit': '7', },
    { 'name': '桃', 'color': 1, 'digit': '8', },
    { 'name': '桃', 'color': 1, 'digit': '9', },
    { 'name': '桃', 'color': 1, 'digit': '12', },
    { 'name': '桃', 'color': 0, 'digit': '12', },
    { 'name': '诸葛连弩', 'color': 2, 'digit': '1', },
    { 'name': '诸葛连弩', 'color': 0, 'digit': '1', },
    { 'name': '雌雄双股剑', 'color': 3, 'digit': '2', },
    { 'name': '青釭剑', 'color': 3, 'digit': '6', },
    { 'name': '青龙偃月刀', 'color': 3, 'digit': '5', },
    { 'name': '丈八蛇矛', 'color': 3, 'digit': '12', },
    { 'name': '贯石斧', 'color': 0, 'digit': '5', },
    { 'name': '方天画戟', 'color': 0, 'digit': '12', },
    { 'name': '麒麟弓', 'color': 1, 'digit': '5', },
    { 'name': '八卦阵', 'color': 3, 'digit': '2', },
    { 'name': '八卦阵', 'color': 2, 'digit': '2', },
    { 'name': '绝影', 'color': 3, 'digit': '5', },
    { 'name': '的卢', 'color': 2, 'digit': '5', },
    { 'name': '爪黄飞电', 'color': 1, 'digit': '13', },
    { 'name': '赤兔', 'color': 1, 'digit': '5', },
    { 'name': '大宛', 'color': 3, 'digit': '13', },
    { 'name': '紫骍', 'color': 0, 'digit': '13', },
    { 'name': '五谷丰登', 'color': 1, 'digit': '3', },
    { 'name': '五谷丰登', 'color': 1, 'digit': '4', },
    { 'name': '桃园结义', 'color': 1, 'digit': '1', },
    { 'name': '南蛮入侵', 'color': 3, 'digit': '7', },
    { 'name': '南蛮入侵', 'color': 3, 'digit': '13', },
    { 'name': '南蛮入侵', 'color': 2, 'digit': '7', },
    { 'name': '万箭齐发', 'color': 1, 'digit': '1', },
    { 'name': '决斗', 'color': 3, 'digit': '1', },
    { 'name': '决斗', 'color': 2, 'digit': '1', },
    { 'name': '决斗', 'color': 0, 'digit': '1', },
    { 'name': '无中生有', 'color': 1, 'digit': '7', },
    { 'name': '无中生有', 'color': 1, 'digit': '8', },
    { 'name': '无中生有', 'color': 1, 'digit': '9', },
    { 'name': '无中生有', 'color': 1, 'digit': '11', },
    { 'name': '顺手牵羊', 'color': 3, 'digit': '3', },
    { 'name': '顺手牵羊', 'color': 3, 'digit': '4', },
    { 'name': '顺手牵羊', 'color': 3, 'digit': '11', },
    { 'name': '顺手牵羊', 'color': 0, 'digit': '4', },
    { 'name': '顺手牵羊', 'color': 0, 'digit': '1', },
    { 'name': '过河拆桥', 'color': 3, 'digit': '3', },
    { 'name': '过河拆桥', 'color': 3, 'digit': '4', },
    { 'name': '过河拆桥', 'color': 3, 'digit': '12', },
    { 'name': '过河拆桥', 'color': 2, 'digit': '3', },
    { 'name': '过河拆桥', 'color': 2, 'digit': '4', },
    { 'name': '过河拆桥', 'color': 1, 'digit': '12', },
    { 'name': '借刀杀人', 'color': 2, 'digit': '12', },
    { 'name': '借刀杀人', 'color': 2, 'digit': '13', },
    { 'name': '无懈可击', 'color': 3, 'digit': '11', },
    { 'name': '无懈可击', 'color': 2, 'digit': '12', },
    { 'name': '无懈可击', 'color': 2, 'digit': '13', },
    { 'name': '乐不思蜀', 'color': 3, 'digit': '6', },
    { 'name': '乐不思蜀', 'color': 2, 'digit': '6', },
    { 'name': '乐不思蜀', 'color': 1, 'digit': '6', },
    { 'name': '闪电', 'color': 3, 'digit': '1', },
    { 'name': '寒冰剑', 'color': 3, 'digit': '2', },
    { 'name': '仁王盾', 'color': 2, 'digit': '2', },
    { 'name': '闪电', 'color': 1, 'digit': '12', },
    { 'name': '无懈可击', 'color': 0, 'digit': '12', }
];

sgs.EQUIP_RANGE_MAPPING = {
    "诸葛连弩": 1,
    "寒冰剑" : 2,
    "雌雄双股剑" : 2,
    "清鉷剑" : 2,
    "青龙偃月刀" : 3,
    "丈八蛇矛" : 3,
    "贯石斧" : 4,
    "方天画戟" : 5,
    "麒麟弓" : 5,
};

sgs.EQUIP_TYPE_MAPPING = {
    /* 0:武器, 1:防具, 2:+1马, 3:-1马 */
    "诸葛连弩" : 0,
    "雌雄双股剑" : 0,
    "青釭剑" : 0,
    "青龙偃月刀" : 0,
    "丈八蛇矛" : 0,
    "贯石斧" : 0,
    "方天画戟" : 0,
    "麒麟弓" : 0,
    "寒冰剑" : 0,
    "八卦阵" : 1,
    "仁王盾" : 1,
    "绝影" : 2,
    "的卢" : 2,
    "爪黄飞电" : 2,
    "赤兔" : 3,
    "大宛" : 3,
    "紫骍" : 3,
};

sgs.IDENTITY_MAPPING = { /* 人数对应角色数量 */
    /* 0: "主公", 1: "忠臣", 2: "内奸", 3: "反贼" */
    4: [0, 1, 2, 3]
};

sgs.HERO = [
	["曹操", 4, ["护驾", "奸雄"], "魏", 1],
	["张辽", 4, ["突袭"], "魏", 1],
    ["郭嘉", 3, ["天妒", "遗计"], "魏", 1],
	["夏侯淳", 4, ["刚烈"], "魏", 1],
	["司马懿", 4, ["反馈", ["鬼才"]], "魏", 1],
	["许褚", 4, ["裸衣"], "魏", 1],
	["甄姬", 4, ["洛神", "倾国"], "魏", 1],
	["刘备", 4, ["激将", "仁德"], "蜀", 1],
	["关羽", 4, ["武圣"], "蜀", 1],
	["张飞", 4, ["咆哮"], "蜀", 1],
    ["赵云", 4, ["龙胆"], "蜀", 1],
	["马超", 4, ["马术", "铁骑"], "蜀", 1],
	["诸葛亮", 3, ["观星", "空城"], "蜀", 1],
	["黄月英", 3, ["集智", "奇才"], "蜀", 1],
    ["孙权", 4, ["救援", "制衡"], "吴", 1],
	["周瑜", 3, ["反间", "英姿"], "吴", 1],
	["吕蒙", 4, ["克己"], "吴", 1],
	["陆逊", 3, ["连营", "谦逊"], "吴", 1],
	["甘宁", 4, ["奇袭"], "吴", 1],
    ["黄盖", 4, ["苦肉"], "吴", 1],
	["大乔", 3, ["国色", "流离"], "吴", 1],
	["孙尚香", 3, ["结姻", "枭姬"], "吴", 0],
	["吕布", 4, ["无双"], "群", 1],
	["华佗", 3, ["急救", "青囊"], "群", 1],
	["貂蝉", 3, ["闭月", "离间"], "群", 0]
];
