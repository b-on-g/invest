namespace $ {

	export type $bog_invest_core_share = { bond: string, share: number }
	export type $bog_invest_core_basket = $bog_invest_core_share[]
	export type $bog_invest_core_quartiles = Record< string, $bog_invest_core_basket >
	export type $bog_invest_core_holdings = Record< string, number >
	export type $bog_invest_core_action = 'buy' | 'sell' | 'hold'
	export type $bog_invest_core_order = {
		bond: string
		action: $bog_invest_core_action
		rub: number
		target_rub: number
		current_rub: number
	}

	interface $bog_invest_core_xlsx {
		read( data: ArrayBuffer | Uint8Array, opts: { type: string } ): {
			SheetNames: string[]
			Sheets: Record< string, unknown >
		}
		utils: {
			sheet_to_json< Row >( sheet: unknown ): Row[]
		}
	}

	/** Чистая доменная логика ребаланса ВДО. Без сети — всё в памяти. */
	export class $bog_invest_core extends $mol_object {

		static xlsx() {
			// вендоренный UMD-билд core/xlsx.js: в web-бандле регистрируется в $node под этим id
			return require( '../bog/invest/core/xlsx' ) as $bog_invest_core_xlsx
		}

		/** Ключ для сопоставления имён с разных сторон (xlsx <-> портфель): аптрим, схлоп пробелов, латиница/кириллица P/Р в одну */
		static norm_name( raw: string ): string {
			return raw
				.toUpperCase()
				.replace( /\s+/g, ' ' )
				.replace( /[PР]/g, 'P' )
				.trim()
		}

		/** Читает все листы Qx с колонками "облигация" / "доля в Q" */
		static load_quartiles( data: ArrayBuffer | Uint8Array ): $bog_invest_core_quartiles {
			const wb = this.xlsx().read( data, { type: 'array' } )
			const out: $bog_invest_core_quartiles = {}
			for( const sheet_name of wb.SheetNames ) {
				const rows = this.xlsx().utils.sheet_to_json< Record< string, unknown > >( wb.Sheets[ sheet_name ] )
				const basket: $bog_invest_core_basket = []
				for( const r of rows ) {
					const bond = String( r[ 'облигация' ] ?? '' ).trim()
					const share = Number( r[ 'доля в Q' ] )
					if( bond && Number.isFinite( share ) ) basket.push({ bond, share })
				}
				if( basket.length ) out[ sheet_name ] = basket
			}
			return out
		}

		/** Доли в файле суммируются ~в 100, но не ровно. Приводим к сумме 100 */
		static normalize_weights( basket: $bog_invest_core_basket ): $bog_invest_core_basket {
			const sum = basket.reduce( ( s, b )=> s + b.share, 0 )
			if( sum <= 0 ) return basket.map( b=> ({ ...b, share: 0 }) )
			return basket.map( b=> ({ bond: b.bond, share: b.share / sum * 100 }) )
		}

		/** Оставить только разрешённые имена и пере-нормировать веса на них */
		static restrict_to( basket: $bog_invest_core_basket, allowed: Set< string > ): $bog_invest_core_basket {
			const kept = basket.filter( b=> allowed.has( this.norm_name( b.bond ) ) )
			return this.normalize_weights( kept )
		}

		/** Целевая аллокация в ₽ по капиталу; ключи нормализованные */
		static target_rub( basket: $bog_invest_core_basket, capital: number ): $bog_invest_core_holdings {
			const norm = this.normalize_weights( basket )
			const out: $bog_invest_core_holdings = {}
			for( const b of norm ) out[ this.norm_name( b.bond ) ] = b.share / 100 * capital
			return out
		}

		/** Diff между текущим портфелем и целью -> список ордеров в ₽. min_order_rub — не дёргаемся из-за копеечных расхождений */
		static rebalance(
			current: $bog_invest_core_holdings,
			target: $bog_invest_core_holdings,
			min_order_rub = 0,
		): $bog_invest_core_order[] {
			const keys = new Set([ ... Object.keys( current ), ... Object.keys( target ) ])
			const orders: $bog_invest_core_order[] = []
			for( const k of keys ) {
				const cur = current[ k ] ?? 0
				const tgt = target[ k ] ?? 0
				const delta = tgt - cur
				let action: $bog_invest_core_action = 'hold'
				if( Math.abs( delta ) > min_order_rub ) action = delta > 0 ? 'buy' : 'sell'
				orders.push({ bond: k, action, rub: Math.abs( delta ), target_rub: tgt, current_rub: cur })
			}
			// сначала продажи (освобождаем кэш), потом покупки; внутри — по размеру
			const rank = ( a: $bog_invest_core_action )=> a === 'sell' ? 0 : a === 'buy' ? 1 : 2
			return orders.sort( ( a, b )=> rank( a.action ) - rank( b.action ) || b.rub - a.rub )
		}

		/** Парсит paste-портфель: по строке на позицию, "ИМЯ БУМАГИ 40000" (сумма — последнее число в строке).
		 * holdings — по нормализованным ключам, names — ключ -> имя как ввёл пользователь */
		static parse_portfolio( text: string ): {
			holdings: $bog_invest_core_holdings
			names: Record< string, string >
		} {
			const holdings: $bog_invest_core_holdings = {}
			const names: Record< string, string > = {}
			for( const line of text.split( '\n' ) ) {
				const match = line.trim().match( /^(.+?)[\s;,\t]+([\d\s]+(?:[.,]\d+)?)\s*₽?$/ )
				if( !match ) continue
				const name = match[ 1 ].trim()
				const rub = Number( match[ 2 ].replace( /\s/g, '' ).replace( ',', '.' ) )
				if( !name || !Number.isFinite( rub ) ) continue
				const key = this.norm_name( name )
				holdings[ key ] = ( holdings[ key ] ?? 0 ) + rub
				names[ key ] = name
			}
			return { holdings, names }
		}

	}

}
