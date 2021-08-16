/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/explicit-function-return-type */

import Link from 'next/link'
import styles from './header.module.scss'
import { format } from 'date-fns'
import  ptBR from 'date-fns/locale/pt-BR'
export default function Header() {
  return (
    <header className={styles.headerSection}> 
      <Link href="/">
        <a>
          <img src="/logo.svg" alt="logo" />
        </a>
      </Link>
    </header>
  )
}
