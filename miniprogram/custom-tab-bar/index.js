Component({
	data: {
		active: 0,
		list: [
			{
				icon: 'shop-collect',
				text: '喜鞋商城',
				url: '/pages/home/home'
			},
			{
				icon: 'vip-card',
				text: '我的会员卡',
				url: '/pages/mine/mine'
			}
		]
	},

	methods: {
		onChange(event) {
			this.setData({ active: event.detail });
			wx.switchTab({
				url: this.data.list[this.data.active].url
			});
		},

		init() {
			const page = getCurrentPages().pop();
			this.setData({
				active: this.data.list.findIndex(item => item.url === `/${page.route}`)
			});
		}
	},

	options: {
		addGlobalClass: true,
	}
});
