import { parseJwt } from '~/utils/parseJwt';
import Cookies from 'js-cookie';

export default defineNuxtRouteMiddleware((to) => {
    const router = useRouter();
    const rawToken = Cookies.get('token');
    if (rawToken) {
        const token = parseJwt(rawToken);
        const allowedRoles = ['ADMIN', 'GOVERNMENT', 'AKIMAT_ADMIN', 'AKIMAT_MANAGER'];

        if (!token || !allowedRoles.includes(token.role)) {
            router.push('/');
        }
    } else router.push('/')

});