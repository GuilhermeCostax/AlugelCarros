package com.aluguelcarros.security;

import com.aluguelcarros.model.Usuario;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import java.time.Instant;

/** Gera os tokens JWT entregues no login. */
@Service
public class TokenService {

    private final JwtEncoder encoder;
    private final long expiracaoMs;

    public TokenService(JwtEncoder encoder, @Value("${app.jwt.expiration-ms}") long expiracaoMs) {
        this.encoder = encoder;
        this.expiracaoMs = expiracaoMs;
    }

    public String gerarToken(Usuario usuario) {
        Instant agora = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("aluguel-carros")
                .issuedAt(agora)
                .expiresAt(agora.plusMillis(expiracaoMs))
                .subject(usuario.getLogin())
                .claim("uid", usuario.getId())
                .claim("perfil", usuario.getPerfil().name())
                .build();
        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
        return encoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
    }
}
