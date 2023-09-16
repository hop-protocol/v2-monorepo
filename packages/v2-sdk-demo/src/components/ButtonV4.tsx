import React, { FC } from 'react'
import { makeStyles } from '@mui/styles'
import MuiButton, { ButtonProps as MuiButtonProps } from '@mui/material/Button'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import { useThemeMode } from '../themev4/ThemeProvider'

interface StyleProps {
  highlighted: boolean
  large: boolean
  flat: boolean
  size?: number | string
  borderRadius?: any
  children?: any
  onClick?: any
  loading?: boolean
  isDarkMode?: boolean
  fullWidth?: boolean
  target?: string
  rel?: string
  text?: boolean
}

export type ButtonProps = Partial<StyleProps> &
  MuiButtonProps & { boxShadow?: any; minWidth?: string }

const useStyles = makeStyles((theme: any) => {
  return {
    root: ({ highlighted, large, flat, text, isDarkMode, fullWidth }: StyleProps) => {
      return {
        borderRadius: '3.0rem',
        textTransform: 'none',
        padding: large ? '0.8rem 4.2rem' : '0.8rem 2.8rem',
        minHeight: large ? '5.5rem' : '4.0rem',
        fontSize: large ? '2.2rem' : '1.5rem',
        width: fullWidth ? '100%' : 'auto',
        color: text ? theme.palette.text.secondary : (highlighted ? 'white' : theme.palette.text.primary),
        background: text ? 'none' : (highlighted
          ? theme.bgGradient.main
          : isDarkMode
          ? '#3A3547'
          : flat
          ? '#E2E2E5'
          : 'none'),
        boxShadow: text ? 'none' : (highlighted ? theme.boxShadow.button.highlighted : theme.boxShadow.button.default),
        '&:hover': {
          color: text ? theme.palette.text.primary : (highlighted ? 'white' : theme.palette.text.primary),
          background: text ? 'none' : (highlighted
            ? theme.bgGradient.main
            : flat
            ? theme.palette.secondary.light
            : '#ffffff33'),
        },
        transition: 'background-color 0.15s ease-out, box-shadow 0.15s ease-out',
        '&:disabled': {
          // background: '#272332',
          // boxShadow: theme.boxShadow.button.default,
          // color: '#0202027f',
        },
      }
    },
    disabled: {
      color: '#FDF7F9',
      background: 'none',
    },
    spinner: {
      display: 'inline-flex',
      marginLeft: '1rem',
    },
  }
})

const LargeButton: FC<ButtonProps> = props => {
  const {
    className,
    children,
    highlighted = false,
    large = false,
    flat = false,
    text = false,
    disabled = false,
    loading = false,
    size = 40,
    boxShadow,
    minWidth,
    borderRadius,
    fullWidth = false,
    ...buttonProps
  } = props
  const { isDarkMode } = useThemeMode()
  const styles = useStyles({ highlighted, large, flat, text, isDarkMode, fullWidth })

  return (
    <Box display="flex" width="100%">
      <MuiButton
        {...buttonProps}
        disabled={disabled || loading}
        className={`${styles.root} ${className}`}
        classes={{ disabled: styles.disabled }}
      >
        {children}
        {loading ? (
          <div className={styles.spinner}>
            <CircularProgress size={large ? '2rem' : size} />
          </div>
        ) : null}
      </MuiButton>
    </Box>
  )
}

export default LargeButton
