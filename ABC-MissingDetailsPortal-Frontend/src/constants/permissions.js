import * as roles from './roleTypes'

export default {
  [roles.MANAGEMENT_USER]: {
    queries: { 
      canRespond: true,
      canReject: true,
      canReassign: true,
      canSendEmail: true,
      canEscalate: true
    }
  }
}