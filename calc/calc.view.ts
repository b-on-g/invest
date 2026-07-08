namespace $.$$ {

	const fmt = ( n: number )=> n.toLocaleString( 'ru-RU', { maximumFractionDigits: 0 } ) + ' ₽'

	export class $bog_invest_calc extends $.$bog_invest_calc {

		profile_data() {
			const home = this.$.$giper_baza_glob.home()
			return home.land().Data( $bog_invest_store_profile )
		}

		@ $mol_mem
		xlsx_files( next?: File[] ) {
			return next ?? []
		}

		@ $mol_mem
		quartiles() {
			const files = this.xlsx_files()
			if( !files.length ) return null
			const buf = $mol_wire_sync( files[ 0 ] ).arrayBuffer()
			return $bog_invest_core.load_quartiles( new Uint8Array( buf ) )
		}

		@ $mol_mem
		import_label() {
			const files = this.xlsx_files()
			if( !files.length ) return 'Загрузить xlsx с квартилями'
			const q = this.quartiles()
			const sheets = q
				? Object.keys( q ).map( k=> `${ k }(${ q[ k ].length })` ).join( ' ' )
				: 'листы не распознаны'
			return `${ files[ 0 ].name } — ${ sheets }`
		}

		@ $mol_mem
		quartile_options() {
			const q = this.quartiles()
			if( !q ) return { Q1: 'Q1', Q2: 'Q2', Q3: 'Q3', Q4: 'Q4' } as Record< string, string >
			const out: Record< string, string > = {}
			for( const key of Object.keys( q ) ) out[ key ] = key
			return out
		}

		@ $mol_mem
		portfolio_text( next?: string ) {
			const profile = this.profile_data()
			if( next !== undefined ) {
				profile.Portfolio( 'auto' )?.val( next )
				return next
			}
			return profile.Portfolio()?.val() ?? ''
		}

		@ $mol_mem
		portfolio() {
			return $bog_invest_core.parse_portfolio( this.portfolio_text() )
		}

		@ $mol_mem
		basket() {
			const q = this.quartiles()
			if( !q ) return null
			return q[ this.quartile() ] ?? null
		}

		@ $mol_mem
		orders() {
			const basket = this.basket()
			if( !basket ) return []
			const target = $bog_invest_core.target_rub( basket, this.capital() )
			return $bog_invest_core.rebalance( this.portfolio().holdings, target, this.min_order() )
		}

		@ $mol_mem
		active_orders() {
			return this.orders().filter( o=> o.action !== 'hold' )
		}

		@ $mol_mem
		buys() {
			return this.active_orders().filter( o=> o.action === 'buy' )
		}

		@ $mol_mem
		sells() {
			return this.active_orders().filter( o=> o.action === 'sell' )
		}

		/** нормализованный ключ -> человеческое имя (из xlsx или как ввёл пользователь) */
		@ $mol_mem
		display_names() {
			const map: Record< string, string > = { ... this.portfolio().names }
			for( const b of this.basket() ?? [] ) {
				map[ $bog_invest_core.norm_name( b.bond ) ] = b.bond
			}
			return map
		}

		@ $mol_mem
		warnings() {
			const basket = this.basket()
			if( !basket ) return []
			const out: string[] = []

			const norm = $bog_invest_core.normalize_weights( basket )
			const min_share = Math.min( ... norm.map( b=> b.share ) )
			const min_pos = min_share / 100 * this.capital()
			if( min_pos < 3000 ) out.push(
				`Капитала мало: хвост корзины ~${ fmt( min_pos ) } на имя — позиции квантуются в 1–2 бумаги или в ноль`,
			)

			const count = this.active_orders().length
			if( count > 50 ) out.push(
				`${ count } ордеров руками — прикинь комиссию и спред, на неликвиде они съедают премию`,
			)

			if( !Object.keys( this.portfolio().holdings ).length ) out.push(
				'Портфель пуст — считаю как первую покупку',
			)

			out.push( 'Снапшот квартилей стухает: проверь дату публикации перед сделками' )
			return out
		}

		@ $mol_mem
		warning_rows() {
			return this.warnings().map( ( _, i )=> this.Warning_row( String( i ) ) )
		}

		warning_text( key: string ) {
			return this.warnings()[ Number( key ) ] ?? ''
		}

		@ $mol_mem
		summary_text() {
			const turnover = this.active_orders().reduce( ( s, o )=> s + o.rub, 0 )
			const basket = this.basket() ?? []
			return `Бумаг в цели: ${ basket.length } · продать: ${ this.sells().length } · купить: ${ this.buys().length } · оборот: ${ fmt( turnover ) }`
		}

		@ $mol_mem
		order_rows() {
			return this.active_orders().map( ( _, i )=> this.Order_row( String( i ) ) )
		}

		order( key: string ) {
			return this.active_orders()[ Number( key ) ]
		}

		order_kind( key: string ) {
			return this.order( key )?.action ?? 'hold'
		}

		order_bond( key: string ) {
			const o = this.order( key )
			if( !o ) return ''
			const name = this.display_names()[ o.bond ] ?? o.bond
			return `${ o.action === 'sell' ? 'Продать' : 'Купить' } ${ name }`
		}

		order_move( key: string ) {
			const o = this.order( key )
			if( !o ) return ''
			return `${ fmt( o.current_rub ) } → ${ fmt( o.target_rub ) }`
		}

		order_rub( key: string ) {
			const o = this.order( key )
			return o ? fmt( o.rub ) : ''
		}

		@ $mol_mem
		result_empty_text() {
			const q = this.quartiles()
			if( q && !this.basket() ) return `В файле нет листа ${ this.quartile() }`
			return 'Загрузи xlsx с листами Q1–Q4 — здесь появится список сделок'
		}

		@ $mol_mem
		result_content() {
			if( !this.basket() ) return [ this.Result_empty() ]
			return [
				this.Summary(),
				this.Warnings(),
				this.Orders(),
				this.Save(),
				... this.saved_now() ? [ this.Saved_note() ] : [],
			]
		}

		@ $mol_mem
		save_key() {
			return [ this.quartile(), this.capital(), this.min_order(), this.portfolio_text() ].join( '|' )
		}

		@ $mol_mem
		saved_key( next?: string ) {
			return next ?? ''
		}

		saved_now() {
			return this.saved_key() === this.save_key()
		}

		@ $mol_action
		save() {
			const turnover = this.active_orders().reduce( ( s, o )=> s + o.rub, 0 )
			const profile = this.profile_data()
			const history = profile.History( 'auto' )!
			const record = history.make( null )
			record.Date( 'auto' )?.val( Date.now() )
			record.Quartile( 'auto' )?.val( this.quartile() )
			record.Capital( 'auto' )?.val( this.capital() )
			record.Buys( 'auto' )?.val( this.buys().length )
			record.Sells( 'auto' )?.val( this.sells().length )
			record.Turnover( 'auto' )?.val( turnover )
			this.saved_key( this.save_key() )
		}

	}

}
