namespace $ {

	$mol_test({

		'norm_name: аптрим, пробелы, кириллическая Р'() {
			$mol_assert_equal( $bog_invest_core.norm_name( '  апри  2р10 ' ), 'АПPИ 2P10' )
			$mol_assert_equal(
				$bog_invest_core.norm_name( 'АПРИ 2Р10' ),
				$bog_invest_core.norm_name( 'АПPИ 2P10' ),
			)
		},

		'normalize_weights: сумма приводится к 100'() {
			const basket = [
				{ bond: 'А', share: 30 },
				{ bond: 'Б', share: 30 },
			]
			const norm = $bog_invest_core.normalize_weights( basket )
			$mol_assert_equal( norm[ 0 ].share, 50 )
			$mol_assert_equal( norm[ 1 ].share, 50 )
		},

		'target_rub: сумма целевых равна капиталу'() {
			const basket = [
				{ bond: 'А', share: 60 },
				{ bond: 'Б', share: 40 },
			]
			const target = $bog_invest_core.target_rub( basket, 100_000 )
			const sum = Object.values( target ).reduce( ( s, v )=> s + v, 0 )
			$mol_assert_equal( Math.round( sum ), 100_000 )
			$mol_assert_equal( target[ 'А' ], 60_000 )
		},

		'rebalance: лишняя бумага в продажу, недостающая в покупку'() {
			const current = { 'А': 10_000, 'В': 5_000 }
			const target = { 'А': 60_000, 'Б': 40_000 }
			const orders = $bog_invest_core.rebalance( current, target, 500 )

			const sell = orders.find( o=> o.bond === 'В' )!
			$mol_assert_equal( sell.action, 'sell' as const )
			$mol_assert_equal( sell.rub, 5_000 )

			const buy_a = orders.find( o=> o.bond === 'А' )!
			$mol_assert_equal( buy_a.action, 'buy' as const )
			$mol_assert_equal( buy_a.rub, 50_000 )

			// продажи раньше покупок
			$mol_assert_equal( orders[ 0 ].action, 'sell' as const )
		},

		'rebalance: мелкие расхождения ниже порога держим'() {
			const orders = $bog_invest_core.rebalance( { 'А': 99_800 }, { 'А': 100_000 }, 500 )
			$mol_assert_equal( orders[ 0 ].action, 'hold' as const )
		},

		'restrict_to: фильтр с пере-нормировкой'() {
			const basket = [
				{ bond: 'А', share: 50 },
				{ bond: 'Б', share: 25 },
				{ bond: 'В', share: 25 },
			]
			const kept = $bog_invest_core.restrict_to( basket, new Set([ 'Б', 'В' ]) )
			$mol_assert_equal( kept.length, 2 )
			$mol_assert_equal( kept[ 0 ].share, 50 )
		},

		'parse_portfolio: строки с суммами, дубли складываются'() {
			const text = [
				'АПРИ 2Р10 40 000',
				'Фордевинд4	8000',
				'ТГК-14 1Р2; 25000.50',
				'мусорная строка',
				'АПРИ 2Р10 10000',
			].join( '\n' )
			const { holdings, names } = $bog_invest_core.parse_portfolio( text )
			$mol_assert_equal( holdings[ $bog_invest_core.norm_name( 'АПРИ 2Р10' ) ], 50_000 )
			$mol_assert_equal( holdings[ $bog_invest_core.norm_name( 'Фордевинд4' ) ], 8_000 )
			$mol_assert_equal( holdings[ $bog_invest_core.norm_name( 'ТГК-14 1Р2' ) ], 25_000.5 )
			$mol_assert_equal( Object.keys( holdings ).length, 3 )
			$mol_assert_equal( names[ $bog_invest_core.norm_name( 'АПРИ 2Р10' ) ], 'АПРИ 2Р10' )
		},

	})

}
