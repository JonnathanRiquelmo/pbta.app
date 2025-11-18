import { useTranslation } from 'react-i18next'

export default function RollsRoute() {
  const { t } = useTranslation()
  return <div>{t('session.rolls.title')}</div>
}