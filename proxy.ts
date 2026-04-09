import { auth } from '@/auth';

export default auth(() => {
  return undefined;
});

export function proxy(){
  
}
export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
