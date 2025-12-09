export function getErrorMessage(errorCode: string): string {
  switch (errorCode) {
    // Auth & Permissions
    case 'not_authenticated':
      return 'Você precisa estar autenticado para realizar esta ação.'
    case 'forbidden':
      return 'Você não tem permissão para realizar esta ação.'
    case 'permission_denied':
      return 'Permissão negada.'
    
    // Validation - General
    case 'invalid_required_fields':
      return 'Por favor, preencha todos os campos obrigatórios.'
    case 'invalid_attributes_sum':
      return 'A soma dos atributos deve ser igual a 3.'
    case 'not_found':
      return 'Item não encontrado.'
    case 'invalid':
      return 'Inválido.'
    
    // Validation - Moves
    case 'invalid_name':
      return 'O nome é obrigatório.'
    case 'invalid_modifier':
      return 'O modificador deve ser entre -1 e +3.'
    case 'move_not_active':
      return 'Este movimento não está mais ativo na campanha.'
    case 'move_not_in_sheet':
      return 'Você só pode usar movimentos que selecionou na sua ficha.'
    
    // Validation - Sessions
    case 'invalid_session':
      return 'Sessão inválida.'
    
    // Validation - Sheets
    case 'invalid_sheet':
      return 'Ficha inválida.'
    case 'invalid_attribute':
      return 'Atributo inválido.'
    case 'sheet_not_found':
      return 'Ficha não encontrada.'
    
    // Invites
    case 'expired':
      return 'O convite expirou.'
    case 'limit_reached':
      return 'O limite de usos do convite foi atingido.'
    
    // Operations
    case 'create_failed':
      return 'Erro ao criar item. Tente novamente.'
    case 'update_failed':
      return 'Erro ao atualizar item. Tente novamente.'
    case 'remove_failed':
      return 'Erro ao remover item. Tente novamente.'
    case 'not_supported':
      return 'Operação não suportada.'

    default:
      // If it's a sentence already, return it, otherwise generic error
      if (errorCode.includes(' ')) return errorCode
      return `Erro desconhecido: ${errorCode}`
  }
}
