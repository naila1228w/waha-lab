const memberProfiles = {
    'lifeng-li': {
        name: 'LIFENG LI',
        role: '创始人&CEO 设计总监',
        image: 'assets/team-lifeng-li.jpg',
        alt: '李立峰',
        bio: '清华大学-北京林业大学联合培养艺术学学士；清华系 AI SaaS 公司，越天进化（北京）科技有限公司合伙人；真格基金零零后狠人计划入选成员（全球仅 16 名）；松山湖 Xbotpark 2022 Summer Camp 优秀营员，智能硬件领域连续创业者；2024 年深圳市十大杰出设计青年。'
    },
    'boxu-zhang': {
        name: 'BOXU ZHANG',
        role: '合伙人&设计总监',
        image: 'assets/team-boxu-zhang.jpg',
        alt: '张博栩',
        bio: '广美达芬奇学院优秀校友；松山湖 Xbotpark 2022 Summer Camp 优秀营员；曾任浙大系咖啡设备品牌 REDXKEY 合伙人兼设计总监，清华系智能穿戴品牌 Dymesty 设计总监兼产品经理；拥有丰富的智能硬件产品设计和创新商业项目落地经验。'
    },
    'yixuan-song': {
        name: 'YIXUAN SONG',
        role: '合伙人&设计总监',
        image: 'assets/team-yixuan-song.jpg',
        alt: '宋一煊',
        bio: '广美工业设计学士；曾任广天院核心设计师，主导多款 ToC 消费电子与智能硬件的从零到一全流程开发；曾获多个国内外设计大奖；对 CMF 趋势及前沿设计趋势有敏锐洞察，善于将前瞻性设计概念转化为兼具商业价值与极致用户体验的量产产品。'
    },
    'lin-xie': {
        name: 'LIN XIE',
        role: '合伙人&平面总监',
        image: 'assets/team-lin-xie.jpg',
        alt: '谢琳',
        bio: '中央美术学院品牌设计学士；同时拥有甲乙方不同视角的产品设计、平面设计、品牌设计经验。善于从全局商业策略出发，构建兼具艺术美感与市场穿透力的视觉语言；在消费品包装、数字界面（UI）视觉体系及品牌全案落地方面拥有深厚积淀，致力于通过系统化的视觉设计为硬件产品与科技品牌注入独特的品牌感知力。'
    },
    'jiankai-li': {
        name: 'JIANKAI LI',
        role: '工业设计师',
        image: 'assets/team-jiankai-li.jpg',
        alt: '李建凯',
        bio: '产品设计学士；兼具深厚的设计美学素养与扎实的工程落地能力；曾深度参与多款智能穿戴及消费类硬件项目的 ID 设计与人机工程学优化；擅长在复杂的功能限制中寻找最纯粹、直观的设计解法，致力于打造兼具直觉美感与高完成度的硬件产品。'
    }
};

const memberKey = new URLSearchParams(window.location.search).get('member') || 'lifeng-li';
const member = memberProfiles[memberKey] || memberProfiles['lifeng-li'];

document.querySelector('[data-member-name]').textContent = member.name;
document.querySelector('[data-member-role]').textContent = member.role;
document.querySelector('[data-member-bio]').textContent = member.bio;

const memberImage = document.querySelector('[data-member-image]');
memberImage.src = member.image;
memberImage.alt = member.alt;
document.title = `${member.name} - WAhA Lab`;
