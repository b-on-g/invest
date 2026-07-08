namespace $.$$ {

	$mol_style_define( $bog_invest_calc, {

		Content: {
			flex: {
				direction: 'column',
			},
			gap: '1rem',
			padding: {
				top: '1rem',
				bottom: '2rem',
				left: '1rem',
				right: '1rem',
			},
			maxWidth: '640px',
			align: {
				self: 'center',
			},
			width: '100%',
			boxSizing: 'border-box',
		},

		Import_card: {
			flex: {
				direction: 'column',
			},
			gap: '0.25rem',
			padding: {
				top: '1rem',
				bottom: '1rem',
				left: '1rem',
				right: '1rem',
			},
			border: {
				radius: $mol_gap.round,
			},
			background: {
				color: $mol_theme.card,
			},
		},

		Import_label: {
			font: {
				weight: 600,
			},
		},

		Local_hint: {
			font: {
				size: '0.8rem',
			},
			opacity: 0.5,
		},

		Params_card: {
			gap: '1rem',
			flex: {
				wrap: 'wrap',
			},
			padding: {
				top: '0.75rem',
				bottom: '0.75rem',
				left: '1rem',
				right: '1rem',
			},
			border: {
				radius: $mol_gap.round,
			},
			background: {
				color: $mol_theme.card,
			},
		},

		Quartile_field: {
			flex: {
				direction: 'column',
			},
			gap: '0.25rem',
		},

		Capital_field: {
			flex: {
				direction: 'column',
			},
			gap: '0.25rem',
		},

		Min_order_field: {
			flex: {
				direction: 'column',
			},
			gap: '0.25rem',
		},

		Quartile_label: {
			font: {
				size: '0.8rem',
			},
			opacity: 0.6,
		},

		Capital_label: {
			font: {
				size: '0.8rem',
			},
			opacity: 0.6,
		},

		Min_order_label: {
			font: {
				size: '0.8rem',
			},
			opacity: 0.6,
		},

		Portfolio_card: {
			flex: {
				direction: 'column',
			},
			gap: '0.5rem',
			padding: {
				top: '0.75rem',
				bottom: '0.75rem',
				left: '1rem',
				right: '1rem',
			},
			border: {
				radius: $mol_gap.round,
			},
			background: {
				color: $mol_theme.card,
			},
		},

		Portfolio_label: {
			font: {
				weight: 600,
			},
		},

		Portfolio: {
			minHeight: '6rem',
		},

		Result_card: {
			flex: {
				direction: 'column',
			},
			gap: '0.75rem',
			padding: {
				top: '0.75rem',
				bottom: '0.75rem',
				left: '1rem',
				right: '1rem',
			},
			border: {
				radius: $mol_gap.round,
			},
			background: {
				color: $mol_theme.card,
			},
		},

		Result_empty: {
			textAlign: 'center',
			opacity: 0.5,
		},

		Summary: {
			font: {
				weight: 600,
			},
		},

		Warnings: {
			gap: '0.25rem',
		},

		Warning_row: {
			font: {
				size: '0.85rem',
			},
			color: $mol_theme.focus,
		},

		Orders: {
			gap: '0.25rem',
		},

		Order_row: {
			justify: {
				content: 'space-between',
			},
			align: {
				items: 'center',
			},
			gap: '0.75rem',
			padding: {
				top: '0.375rem',
				bottom: '0.375rem',
				left: '0.5rem',
				right: '0.5rem',
			},
			border: {
				radius: $mol_gap.round,
			},
			'@': {
				'bog_invest_action': {
					'sell': {
						background: {
							color: '#d92f2f18',
						},
					},
					'buy': {
						background: {
							color: '#1fa72a18',
						},
					},
				},
			},
		},

		Order_bond: {
			font: {
				weight: 600,
			},
			flex: {
				grow: 1,
			},
		},

		Order_move: {
			font: {
				size: '0.8rem',
			},
			opacity: 0.6,
			whiteSpace: 'nowrap',
		},

		Order_rub: {
			font: {
				weight: 700,
			},
			whiteSpace: 'nowrap',
		},

		Save: {
			align: {
				self: 'flex-start',
			},
		},

		Saved_note: {
			color: $mol_theme.hover,
			font: {
				size: '0.85rem',
			},
		},

	})

}
